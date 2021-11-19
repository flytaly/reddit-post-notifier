/* eslint-disable @typescript-eslint/unbound-method */
import { postFilter } from '@/text-search/post-filter';
import { cloneDeep } from 'lodash';
import { mocked } from 'ts-jest/utils';
import DEFAULT_OPTIONS from '../options-default';
import RedditApiClient from '../reddit-api/client';
import { RedditComment, RedditError, RedditMessage, RedditObjectKind, RedditPost } from '../reddit-api/reddit-types';
import storage from '../storage';
import { dataFields } from '../storage/fields';
import type { FollowingUser, PostFilterOptions, StorageFields } from '../storage/storage-types';
import { generateMessage, generatePost, generatePosts, generateQuery } from '../test-utils/content-generators';
import { mockDate, restoreDate } from '../test-utils/mock-date';
import type { ExtensionOptions } from '../types/extension-options';
import { getSearchQueryUrl } from '../utils';
import app from './app';
import notify, { NotificationId } from './notifications';

jest.mock('../storage/storage.ts');
jest.mock('../reddit-api/client.ts');
jest.mock('./notifications.ts');
jest.mock('../utils/wait.ts');
jest.mock('@/text-search/post-filter.ts');

const mockStorage = mocked(storage, true);
const mockClient = mocked(new RedditApiClient(), true);
const mockNotify = mocked(notify);

const getOpts = (opts: Partial<ExtensionOptions> = {}) => ({ ...DEFAULT_OPTIONS, ...opts });
const allData = (data: Partial<StorageFields> = {}) => ({ ...dataFields, ...data });

function mockStorageData(data?: Partial<StorageFields>) {
    mockStorage.getAllData.mockImplementationOnce(() => Promise.resolve(allData(data)));
}

describe('update messages', () => {
    let ts: number;
    let messages: RedditMessage[];
    let newMessages: RedditMessage[];
    const refreshToken = 'refreshToken';

    beforeAll(() => {
        jest.clearAllMocks();
        ts = Date.now();
        const genMsgsByDate = (stamps: number[]) => stamps.map((created) => generateMessage({ created }));
        messages = genMsgsByDate([ts + 2000, ts + 1000, ts, ts - 1000]);
        newMessages = messages.slice(0, 2);
        mockClient.messages.unread.mockResolvedValue({
            kind: 'Listing',
            data: { children: messages },
        });
    });

    test('should update and save new private messages', async () => {
        mockStorageData({
            refreshToken,
            options: getOpts({ messages: true, messagesNotify: false }),
            messages: { lastPostCreated: ts },
        });
        await app.update();
        expect(mockStorage.saveMessageData).toHaveBeenCalledWith({ newMessages, count: messages.length });
        expect(mockNotify).not.toHaveBeenCalled();
    });

    test('should call notification creation', async () => {
        const options = getOpts({ messages: true, messagesNotify: true, notificationSoundId: 'sound_00' });
        mockStorageData({ refreshToken, options, messages: { lastPostCreated: ts } });
        await app.update();
        expect(mockNotify).toHaveBeenCalledWith(NotificationId.mail, newMessages, 'sound_00');
    });

    test("should not call messages updating if extension isn't authorized", async () => {
        mockStorageData({ refreshToken: '', options: getOpts({ messages: true }) });
        mockStorage.getAuthData.mockImplementationOnce(async () => ({ refreshToken: null }));
        mockStorage.saveMessageData.mockClear();
        const stub = jest.spyOn(app, 'updateUnreadMsg');
        await app.update();
        expect(mockStorage.saveMessageData).not.toHaveBeenCalled();
        expect(stub).not.toHaveBeenCalled();
        stub.mockRestore();
    });
});

describe('update subreddits', () => {
    const mockGetSubreddit = mocked(mockClient.getSubreddit);
    const mockSubredditNew = mocked(mockClient.getSubreddit('').new);
    let ts: number;
    let posts: RedditPost[];
    let newPosts: RedditPost[];

    beforeAll(() => {
        jest.clearAllMocks();
        ts = Date.now();

        const genPostsByDate = (stamps: number[]): RedditPost[] =>
            stamps.map((created) => ({ data: generatePost({ created }) }));
        posts = genPostsByDate([ts + 3000, ts + 2000, ts + 1000, ts, ts - 1000, ts - 2000]);
        newPosts = posts.slice(0, 3);
        mockSubredditNew.mockResolvedValue({ kind: 'Listing', data: { children: posts } });
        console.error = jest.fn();
    });

    beforeEach(() => {
        mockGetSubreddit.mockClear();
    });

    test('should fetch and save new posts', async () => {
        const limit = 20;
        mockStorageData({
            subredditList: [
                { id: 'id1', subreddit: 'sub1' },
                { id: 'id2', subreddit: 'sub2', disabled: true },
            ],
            subreddits: { id1: { lastPostCreated: ts, posts: posts.slice(2) } },
            options: getOpts({ limit }),
        });
        await app.update();
        expect(mockGetSubreddit.mock.calls).toEqual([['sub1']]);
        expect(mockSubredditNew).toHaveBeenCalledWith(expect.objectContaining({ limit }));
        expect(mockStorage.saveSubredditData).toHaveBeenCalledWith('id1', expect.objectContaining({ posts: newPosts }));
        expect(mockNotify).not.toHaveBeenCalled();
    });

    test('should create notification', async () => {
        const subreddit = 'sub1';
        mockStorageData({
            subredditList: [{ id: 'id1', subreddit, notify: true }],
            subreddits: { id1: { lastPostCreated: ts, posts: [] } },
            options: getOpts(),
        });
        await app.update();

        // if (batch.length) notify(NotificationId.post, batch, notificationSoundId);
        expect(mockNotify).toHaveBeenCalledWith(
            NotificationId.post,
            [{ len: newPosts.length, link: `https://reddit.com/r/${subreddit}/new`, name: subreddit }],
            null,
        );
    });

    test('should save error', async () => {
        const id = 'itemId';
        mockStorageData({
            subredditList: [{ id, subreddit: 'somesubreddit' }],
        });
        const error: RedditError = { error: 404, message: 'Not found', reason: 'banned' };
        mockSubredditNew.mockResolvedValueOnce(error);
        await app.update();
        expect(mockStorage.saveSubredditData).toHaveBeenCalledWith(id, expect.objectContaining({ error }));
    });

    test('should filter posts', async () => {
        const filterOpts: PostFilterOptions = {
            enabled: true,
            fields: ['author'],
            rules: [[{ field: 'author', query: 'name' }]],
        };
        mockStorageData({
            subredditList: [{ id: 'id1', subreddit: 'sub1', filterOpts }],
            subreddits: { id1: { lastPostCreated: ts, posts: posts.slice(2) } },
            options: getOpts(),
        });

        const _posts = newPosts.slice(1);
        const lastPostCreated = newPosts[0].data.created;

        mocked(postFilter).mockImplementation(() => _posts);

        await app.update();

        expect(postFilter).toHaveBeenCalledWith(newPosts, filterOpts.rules, filterOpts.fields);

        // should pass date of the latest posts
        expect(mockStorage.saveSubredditData).toHaveBeenCalledWith(
            'id1',
            expect.objectContaining({ lastPostCreated, posts: _posts }),
        );
    });
});

describe('update reddit search', () => {
    const mockSubredditSearch = mocked(mockClient.getSubreddit('').search);
    let ts: number;
    let posts: RedditPost[];
    let newPosts: RedditPost[];

    beforeAll(() => {
        jest.clearAllMocks();
        ts = Date.now();

        const genPostsByDate = (stamps: number[]): RedditPost[] =>
            stamps.map((created) => ({ data: generatePost({ created }) }));
        posts = genPostsByDate([ts + 2000, ts + 1000, ts, ts - 1000]);
        newPosts = posts.slice(0, 2);
        mockSubredditSearch.mockResolvedValue({ kind: 'Listing', data: { children: posts } });
    });

    beforeEach(() => mockSubredditSearch.mockClear());

    test('should fetch posts and save', async () => {
        const q1 = generateQuery({ notify: false });
        const q2 = generateQuery({ notify: true });
        const qSkip = generateQuery({ disabled: true });
        mockStorageData({
            queriesList: [q1, qSkip, q2],
            queries: {
                [q1.id]: { lastPostCreated: ts },
                [q2.id]: { lastPostCreated: ts + 1000 },
            },
        });
        mockNotify.mockClear();

        await app.update();

        expect(mockStorage.saveQueryData.mock.calls).toEqual([
            [q1.id, { error: null, posts: newPosts }],
            [q2.id, { error: null, posts: newPosts.slice(0, 1) }],
        ]);

        expect(mockNotify).toHaveBeenCalledWith(
            NotificationId.post,
            [{ len: 1, link: getSearchQueryUrl(q2.query, q2.subreddit, false), name: q2.name }],
            null,
        );
    });
});

describe('update user', () => {
    const mockUser = mocked(mockClient.user);
    const mockUserOverview = mocked(mockClient.user('').overview);
    const mockUserComments = mocked(mockClient.user('').comments);
    const mockUserSubmitted = mocked(mockClient.user('').submitted);
    afterEach(() => jest.clearAllMocks());

    test("should update users' activities ", async () => {
        const oldPosts = generatePosts(2);
        const overview = generatePosts(3);
        const comments = generatePosts(2).map((p) => {
            return {
                kind: RedditObjectKind.comment,
                data: p.data,
            } as unknown as RedditComment;
        });

        const posts = generatePosts(2);

        mockStorageData({
            usersList: [
                { username: 'user1', data: oldPosts, watch: 'overview' },
                { username: 'user2', watch: 'comments' },
                { username: 'user3', watch: 'submitted' },
            ],
            options: getOpts(),
        });

        const kind = 'Listing' as const;
        mockUserOverview.mockResolvedValue({ kind, data: { children: overview } });
        mockUserComments.mockResolvedValue({ kind, data: { children: comments } });
        mockUserSubmitted.mockResolvedValue({ kind, data: { children: posts } });

        await app.update();
        expect(mockUser).toHaveBeenCalledWith('user1');
        expect(mockUser).toHaveBeenCalledWith('user2');
        expect(mockUser).toHaveBeenCalledWith('user3');
        expect(mockUserOverview).toHaveBeenCalled();
        expect(mockUserComments).toHaveBeenCalled();
        expect(mockUserSubmitted).toHaveBeenCalled();

        expect(storage.saveUsersList).toHaveBeenCalledWith([
            expect.objectContaining({
                username: 'user1',
                data: [...overview, ...oldPosts],
                lastPostCreated: overview[0].data.created,
            } as FollowingUser),
            expect.objectContaining({
                username: 'user2',
                data: comments,
                lastPostCreated: comments[0].data.created,
            } as FollowingUser),
            expect.objectContaining({
                username: 'user3',
                data: posts,
                lastPostCreated: posts[0].data.created,
            } as FollowingUser),
        ]);
    });

    describe('throttle requests', () => {
        const ts = Date.now();
        const usersList: FollowingUser[] = [
            { username: 'u1', lastUpdate: ts - 1000 * 65 },
            { username: 'u2', lastUpdate: ts - 1000 * 300 },
            { username: 'u3', lastUpdate: ts - 1000 * 600 },
            { username: 'u4' },
        ];

        beforeAll(() => mockDate(ts));
        afterAll(() => restoreDate());

        test('should skip updating users that were updated recently', async () => {
            mockStorageData({
                usersList: cloneDeep(usersList),
                options: getOpts({ pollUserInterval: 600 }),
            });
            await app.update();
            expect(mockUser.mock.calls.flat(1)).toEqual(['u3', 'u4']);
        });
        test('should skip all except new ones', async () => {
            mockStorageData({
                usersList: cloneDeep(usersList),
                options: getOpts({ pollUserInterval: 900 }),
            });
            await app.update();
            expect(mockUser.mock.calls.flat(1)).toEqual(['u4']);
        });

        test('should not skip', async () => {
            mockStorageData({
                usersList: cloneDeep(usersList),
                options: getOpts({ pollUserInterval: 60 }),
            });
            await app.update();
            expect(mockUser.mock.calls.flat(1)).toEqual(['u1', 'u2', 'u3', 'u4']);
        });

        test('should not skip if update was initiated by the user', async () => {
            mockStorageData({
                usersList: cloneDeep(usersList),
                options: getOpts({ pollUserInterval: 900 }),
            });
            await app.update(true);
            expect(mockUser.mock.calls.flat(1)).toEqual(['u1', 'u2', 'u3', 'u4']);
        });
    });
});
