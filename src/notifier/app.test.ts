/* eslint-disable @typescript-eslint/unbound-method */
import auth from '@/reddit-api/auth';
import RedditApiClient from '@/reddit-api/client';
import { postFilter } from '@/text-search/post-filter';
import { mocked } from 'jest-mock';
import { cloneDeep } from 'lodash';
import DEFAULT_OPTIONS from '../options-default';
import type {
    RedditAccount,
    RedditAccountData,
    RedditComment,
    RedditError,
    RedditMessage,
    RedditPost,
} from '../reddit-api/reddit-types';
import { RedditObjectKind } from '../reddit-api/reddit-types';
import storage from '../storage';
import { dataFields } from '../storage/fields';
import type { AuthUser, FollowingUser, PostFilterOptions, StorageFields } from '../storage/storage-types';
import { generateMessage, generatePost, generatePosts, generateQuery } from '../test-utils/content-generators';
import { mockDate, restoreDate } from '../test-utils/mock-date';
import type { ExtensionOptions } from '../types/extension-options';
import { getSearchQueryUrl } from '../utils';
import NotifierApp from './app';
import notify, { NotificationId as NId } from './notifications';
import type { MessageNotification as MN, PostNotification, UserNotification } from './notifications';
import redditScopes from '@/reddit-api/scopes';

jest.mock('@/storage/storage.ts');
jest.mock('@/reddit-api/client.ts');
jest.mock('@/reddit-api/auth.ts');
jest.mock('@/utils/wait.ts');
jest.mock('@/text-search/post-filter.ts');
jest.mock('./notifications.ts');

const mockStorage = mocked(storage, true);
const mockClient = mocked(new RedditApiClient(), true);
const mockNotify = mocked(notify);

const getOpts = (opts: Partial<ExtensionOptions> = {}) => ({ ...DEFAULT_OPTIONS, ...opts });
const allData = (data: Partial<StorageFields> = {}) => ({ ...dataFields, ...data });

function mockStorageData(data?: Partial<StorageFields>) {
    mockStorage.getAllData.mockImplementationOnce(() => Promise.resolve(allData(data)));
}

beforeAll(() => {
    mocked(auth.getAccessToken).mockImplementation(async () => 'access_token');
});

const contain = expect.objectContaining;

describe('update accounts', () => {
    function createAccounts(users: Partial<AuthUser>[] = [{}]) {
        let _id = 0;
        const accounts: StorageFields['accounts'] = {};
        users.forEach((u) => {
            const id = String(u.id || _id++);
            const refreshToken = `rt${id}`;
            accounts[id] = {
                id,
                ...(u || {}),
                auth: { refreshToken, scope: redditScopes.identity.id, ...(u.auth || {}) },
            };
        });
        return accounts;
    }
    beforeEach(() => jest.clearAllMocks());

    function mockMe(data: Partial<RedditAccountData>): RedditAccount {
        return {
            data: {
                comment_karma: 999,
                total_karma: 1200,
                inbox_count: 0,
                has_mail: false,
                created_utc: Date.now(),
                id: 'reddit_id',
                name: 'username',
                icon_img: 'iconurl',
                ...data,
            },
        };
    }

    test('should update accounts and save to the storage', async () => {
        const app = new NotifierApp();
        let callCount = 0;
        const users: RedditAccount[] = [];
        mocked(mockClient.me).mockImplementation(async () => {
            const res = mockMe({ name: `username_${callCount++}` });
            users.push(res);
            return res;
        });
        const auth = { refreshToken: 'token' };
        const accs = createAccounts([{ auth }, { auth }, { auth: { refreshToken: null } }]);

        await app.updateAccounts(accs);
        expect(app.reddit.setAccessToken).toHaveBeenCalledWith('access_token');
        expect(mockClient.me).toHaveBeenCalledTimes(2);

        const u = users.map((us) => us.data);
        const obj = {
            0: contain({ id: '0', name: u[0].name, img: u[0].icon_img, redditId: u[0].id }),
            1: contain({ id: '1', name: u[1].name, img: u[1].icon_img, redditId: u[1].id }),
            2: { ...accs[2] },
        };
        expect(mockStorage.saveAccounts).toHaveBeenCalledWith(obj);
    });

    test('should update only one account', async () => {
        const accs = createAccounts([{ id: 'a0' }, { id: 'a1' }, { id: 'a2' }]);

        let callCount = 0;
        mocked(mockClient.me).mockImplementation(async () => {
            const c = String(callCount++);
            return mockMe({ id: `redditId_${c}`, name: `name_${c}` });
        });
        await new NotifierApp().updateAccounts(accs, 'a1');
        expect(mockClient.me).toHaveBeenCalledTimes(1);

        const obj = {
            a0: { ...accs['a0'] },
            a1: contain({ id: 'a1', name: 'name_0', redditId: 'redditId_0' }),
            a2: { ...accs['a2'] },
        };
        expect(mockStorage.saveAccounts).toHaveBeenCalledWith(obj);
    });

    test('should remove duplicates', async () => {
        const accs = createAccounts([{ id: 'i1', name: 'n1' }, { id: 'i2' }, { id: 'i3' }]);
        mocked(mockClient.me).mockImplementation(async () => mockMe({ name: 'n1' }));
        const app = new NotifierApp();

        // should remove the latest
        await app.updateAccounts(cloneDeep(accs), 'i3');
        expect(mockStorage.saveAccounts).toHaveBeenCalledWith({ i1: accs.i1, i2: accs.i2 });
        mockStorage.saveAccounts.mockClear();

        // should remove 2nd and 3rd
        await app.updateAccounts(cloneDeep(accs));
        const exp = { i1: expect.objectContaining(accs.i1) };
        expect(mockStorage.saveAccounts).toHaveBeenCalledWith(exp);
    });
});

describe('update messages', () => {
    let ts: number;
    let messages: RedditMessage[];
    let newMessages: RedditMessage[];

    function mockAccounts(users: Partial<AuthUser>[] = [{}], sf: Partial<StorageFields> = {}) {
        let _id = 1;
        const accounts: StorageFields['accounts'] = {};
        users.forEach((u) => {
            const id = String(_id++);
            const base: Partial<AuthUser> = { name: `u${id}`, checkMail: true, mailNotify: false, ...u };
            const mail: AuthUser['mail'] = {
                lastPostCreated: ts,
                messages: [...cloneDeep(messages)],
                ...(u.mail || {}),
            };
            const refreshToken = `rt${id}`;
            accounts[id] = { ...base, id, mail, auth: { refreshToken, scope: 'privatemessages', ...(u.auth || {}) } };
        });
        mockStorageData({ accounts, ...(sf || {}) });
    }

    beforeAll(() => {
        ts = Date.now();
        const genMsgsByDate = (stamps: number[]) => stamps.map((created) => generateMessage({ created }));
        messages = genMsgsByDate([ts + 2000, ts + 1000, ts, ts - 1000]);
        newMessages = messages.slice(0, 2);
        mockClient.messages.unread.mockResolvedValue({ kind: 'Listing', data: { children: messages } });
    });
    beforeEach(() => jest.clearAllMocks());

    test('should update and save', async () => {
        mockAccounts([{ mailNotify: false }]);
        const app = new NotifierApp();
        await app.update();
        expect(mockStorage.saveMessageData).toHaveBeenCalledWith('1', { unreadMessages: newMessages });
        expect(mockNotify).not.toHaveBeenCalled();
        expect(app.reddit.setAccessToken).toHaveBeenCalledWith('access_token');
    });

    test('should update, save, and notify ', async () => {
        mockAccounts([{ mailNotify: true }], { options: getOpts({ notificationSoundId: 'sound_03' }) });
        await new NotifierApp().update();
        expect(mockStorage.saveMessageData).toHaveBeenCalledWith('1', { unreadMessages: newMessages });
        const ntf: MN = { type: NId.mail, items: [{ len: newMessages.length, username: 'u1' }] };
        expect(mockNotify).toHaveBeenCalledWith(ntf, 'sound_03');
    });

    test('should update only with correct scope', async () => {
        mockAccounts([
            { auth: { scope: 'read' } },
            { auth: { scope: 'read privatemessages' } },
            { auth: { scope: 'privatemessages' } },
        ]);
        await new NotifierApp().update();
        expect(mockStorage.saveMessageData.mock.calls).toHaveLength(2);
        expect(mockStorage.saveMessageData).not.toHaveBeenCalledWith('1', { unreadMessages: newMessages });
        expect(mockStorage.saveMessageData).toHaveBeenCalledWith('2', { unreadMessages: newMessages });
        expect(mockStorage.saveMessageData).toHaveBeenCalledWith('3', { unreadMessages: newMessages });
        const calls = mocked(auth.getAccessToken).mock.calls;
        expect(calls).toHaveLength(2);
        expect(calls[0][0]).toMatchObject({ auth: { refreshToken: 'rt2' } });
        expect(calls[1][0]).toMatchObject({ auth: { refreshToken: 'rt3' } });
    });

    test('should not update without refreshToken', async () => {
        mockAccounts([{ auth: { refreshToken: null } }]);
        await new NotifierApp().update();
        expect(mockStorage.saveMessageData.mock.calls).toHaveLength(0);
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
        mockNotify.mockClear();
    });

    test('should set access token', async () => {
        const accounts: Record<string, AuthUser> = {
            ac1: { id: 'ac1', auth: { refreshToken: 'rT1', scope: 'identity read privatemessages history' } },
        };
        mockStorageData({ accounts, subredditList: [{ id: 'id1', subreddit: 's' }] });
        const app = new NotifierApp();
        await app.update();
        expect(mocked(auth.getAccessToken)).toHaveBeenCalledWith(accounts.ac1);
        expect(mocked(mockClient.setAccessToken)).toHaveBeenCalledWith('access_token');
        expect(app.reddit.setAccessToken).toHaveBeenCalledWith('access_token');
    });

    test('should fetch and save new posts', async () => {
        const limit = 20;
        const accounts: Record<string, AuthUser> = { ac1: { id: 'ac1', auth: {} } };
        mockStorageData({
            subredditList: [
                { id: 'id1', subreddit: 'sub1' },
                { id: 'id2', subreddit: 'sub2', disabled: true },
            ],
            subreddits: { id1: { lastPostCreated: ts, posts: posts.slice(2) } },
            options: getOpts({ limit }),
            accounts,
        });
        await new NotifierApp().update();

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
        await new NotifierApp().update();

        const n: PostNotification = {
            type: NId.post,
            items: [{ len: newPosts.length, link: `https://reddit.com/r/${subreddit}/new`, name: subreddit }],
        };

        expect(mockNotify).toHaveBeenCalledWith(n, null);
    });

    test('should save error', async () => {
        const id = 'itemId';
        mockStorageData({
            subredditList: [{ id, subreddit: 'someSubreddit' }],
        });
        const error: RedditError = { error: 404, message: 'Not found', reason: 'banned' };
        mockSubredditNew.mockResolvedValueOnce(error);
        await new NotifierApp().update();
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

        await new NotifierApp().update();

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

        await new NotifierApp().update();

        expect(mockStorage.saveQueryData.mock.calls).toEqual([
            [q1.id, { error: null, posts: newPosts }],
            [q2.id, { error: null, posts: newPosts.slice(0, 1) }],
        ]);

        const ntf: PostNotification = {
            type: NId.post,
            items: [{ len: 1, link: getSearchQueryUrl(q2.query, q2.subreddit, false), name: q2.name }],
        };
        expect(mockNotify).toHaveBeenCalledWith(ntf, null);
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

        await new NotifierApp().update();
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

    describe('notifications', () => {
        const usersList: FollowingUser[] = [
            { username: 'user1', watch: 'overview', notify: true },
            { username: 'user2', watch: 'comments', notify: true },
            { username: 'user3', watch: 'submitted', notify: true },
            { username: 'user4', watch: 'submitted', notify: false },
        ];
        const posts = generatePosts(3);
        const comments = posts as unknown as RedditComment[];
        const len = posts.length;

        beforeAll(() => {
            mockUserOverview.mockResolvedValue({ kind: 'Listing', data: { children: posts } });
            mockUserComments.mockResolvedValue({ kind: 'Listing', data: { children: comments } });
            mockUserSubmitted.mockResolvedValue({ kind: 'Listing', data: { children: posts } });
        });
        afterEach(() => jest.clearAllMocks());

        test('should notify (new reddit)', async () => {
            mockStorageData({ usersList: cloneDeep(usersList), options: getOpts({ notificationSoundId: 'sound_02' }) });
            await new NotifierApp().update();
            const expected: UserNotification = {
                type: NId.user,
                items: [
                    { len, link: `https://reddit.com/user/user1`, name: 'user1' },
                    { len, link: `https://reddit.com/user/user2/comments`, name: 'user2' },
                    { len, link: `https://reddit.com/user/user3/posts`, name: 'user3' },
                ],
            };
            expect(mockNotify).toHaveBeenCalledWith(expected, 'sound_02');
        });
        test('should notify (old reddit)', async () => {
            mockStorageData({ usersList: cloneDeep(usersList), options: getOpts({ useOldReddit: true }) });
            await new NotifierApp().update();
            const expected: UserNotification = {
                type: NId.user,
                items: [
                    { len, link: `https://old.reddit.com/user/user1`, name: 'user1' },
                    { len, link: `https://old.reddit.com/user/user2/comments`, name: 'user2' },
                    { len, link: `https://old.reddit.com/user/user3/submitted`, name: 'user3' },
                ],
            };
            expect(mockNotify).toHaveBeenCalledWith(expected, null);
        });
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
            await new NotifierApp().update();
            expect(mockUser.mock.calls.flat(1)).toEqual(['u3', 'u4']);
        });
        test('should skip all except new ones', async () => {
            mockStorageData({
                usersList: cloneDeep(usersList),
                options: getOpts({ pollUserInterval: 900 }),
            });
            await new NotifierApp().update();
            expect(mockUser.mock.calls.flat(1)).toEqual(['u4']);
        });

        test('should not skip', async () => {
            mockStorageData({
                usersList: cloneDeep(usersList),
                options: getOpts({ pollUserInterval: 60 }),
            });
            await new NotifierApp().update();
            expect(mockUser.mock.calls.flat(1)).toEqual(['u1', 'u2', 'u3', 'u4']);
        });

        test('should not skip if update was initiated by the user', async () => {
            mockStorageData({
                usersList: cloneDeep(usersList),
                options: getOpts({ pollUserInterval: 900 }),
            });
            await new NotifierApp().update(true);
            expect(mockUser.mock.calls.flat(1)).toEqual(['u1', 'u2', 'u3', 'u4']);
        });
    });
});
