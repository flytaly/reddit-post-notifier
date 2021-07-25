/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */
import { mocked } from 'ts-jest/utils';
import DEFAULT_OPTIONS from '../options-default';
import RedditApiClient from '../reddit-api/client';
import type { RedditError, RedditMessage, RedditPost } from '../reddit-api/reddit-types';
import storage from '../storage';
import { dataFields } from '../storage/fields';
import type { StorageFields } from '../storage/storage-types';
import { generateMessage, generatePost, generateQuery } from '../test-utils/content-generators';
import type { ExtensionOptions } from '../types/extension-options';
import { getSearchQueryUrl } from '../utils';
import app from './app';
import notify, { NotificationId } from './notifications';

jest.mock('../storage/storage.ts');
jest.mock('../reddit-api/client.ts');
jest.mock('./notifications.ts');
jest.mock('../utils/wait.ts');

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
            subredditList: ['sub1'],
            subreddits: { sub1: { lastPostCreated: ts, posts: posts.slice(2) } },
            options: getOpts({ limit }),
        });
        await app.update();
        expect(mockGetSubreddit.mock.calls).toEqual([['sub1']]);
        expect(mockSubredditNew).toHaveBeenCalledWith(expect.objectContaining({ limit }));
        expect(mockStorage.saveSubredditData).toHaveBeenCalledWith(
            'sub1',
            expect.objectContaining({ posts: newPosts }),
        );
        expect(mockNotify).not.toHaveBeenCalled();
    });

    test('should create notification', async () => {
        const name = 'sub1';
        mockStorageData({
            subredditList: [name],
            subreddits: { sub1: { lastPostCreated: ts, posts: [] } },
            options: getOpts({ subredditNotify: true }),
        });
        await app.update();

        // if (batch.length) notify(NotificationId.post, batch, notificationSoundId);
        expect(mockNotify).toHaveBeenCalledWith(
            NotificationId.post,
            [{ len: newPosts.length, link: `https://reddit.com/r/${name}/new`, name }],
            null,
        );
    });

    test('should save error', async () => {
        mockStorageData({
            subredditList: ['error_sub'],
        });
        const error: RedditError = { error: 404, message: 'Not found', reason: 'banned' };
        mockSubredditNew.mockResolvedValueOnce(error);
        await app.update();
        expect(mockStorage.saveSubredditData).toHaveBeenCalledWith('error_sub', expect.objectContaining({ error }));
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
        mockStorageData({
            queriesList: [q1, q2],
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
