/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */
import browser from 'webextension-polyfill';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import DEFAULT_OPTIONS from '@/options-default';
import type { TokenResponseBody } from '@/reddit-api/auth';
import type { RedditMessage, RedditMessageData, RedditPost } from '@/reddit-api/reddit-types';
import { generatePost, generatePosts, generateQuery } from '@/test-utils/content-generators';
import { mockDate, restoreDate } from '@/test-utils/mock-date';
import type { ExtensionOptions } from '@/types/extension-options';

import storage from './index';
import type { QueryData, QueryOpts, StorageFields, SubredditData, SubredditOpts } from './storage-types';

const mockGet = vi.spyOn(storage, 'getLocal');
const mockSet = vi.spyOn(storage, 'setLocal');

afterEach(() => {
    vi.clearAllMocks();
});

describe('Authorization and messages', () => {
    type PartialMsg = { data: Partial<RedditMessageData> };
    const oldMsgs: PartialMsg[] = [
        { data: { id: 'm1', created: 1552338638 } },
        { data: { id: 'm2', created: 1552338630 } },
    ];
    const newMsgs: PartialMsg[] = [
        { data: { id: 'm3', created: 1552339005 } },
        { data: { id: 'm4', created: 1552339000 } },
    ];

    const fakeData: StorageFields['accounts'] = {
        a1: {
            id: 'a1',
            auth: {
                accessToken: 'accessToken',
                refreshToken: 'refreshToken',
                expiresIn: 4000000,
                scope: 'scope',
            },
            mail: {
                messages: structuredClone(oldMsgs) as RedditMessage[],
            },
        },
        a2: {
            auth: { refreshToken: 'refreshToken2' },
            mail: { messages: structuredClone(oldMsgs) as RedditMessage[] },
            id: 'a2',
        },
    };

    test('should return accounts data', async () => {
        mockGet.mockImplementation(async (keys) => {
            expect(keys).toMatchObject({ accounts: {} });
            return { accounts: structuredClone(fakeData) };
        });
        const accs = await storage.getAccounts();
        expect(accs).toMatchObject(fakeData);
    });

    test('should save authorization data', async () => {
        mockDate('2019-02-17T00:25:58.000Z');
        const expiresInRelative = 3000;
        const expiresIn = new Date().getTime() + expiresInRelative * 1000;
        mockGet.mockImplementation(async (keys) => {
            expect(keys).toMatchObject({ accounts: {} });
            return { accounts: structuredClone(fakeData) };
        });
        const id = fakeData.a2.id;
        const accessToken = 'access token';
        const refreshToken = 'refresh token';
        const scope = 'scope';
        const dataToSave: TokenResponseBody = {
            scope,
            expires_in: String(expiresInRelative),
            access_token: accessToken,
            refresh_token: refreshToken,
            token_type: '???',
        };
        const expected = structuredClone(fakeData);
        expected[id] = { ...expected[id], auth: { scope, accessToken, refreshToken, expiresIn, error: '' } };
        await storage.saveAuthData({ data: dataToSave, id });
        expect(mockSet).toHaveBeenCalledWith({ accounts: expected });
        restoreDate();
    });

    test('should save private messages', async () => {
        const date = mockDate(new Date());
        mockGet.mockImplementation(async (keys) => {
            expect(keys).toMatchObject({ accounts: {} });
            return { accounts: structuredClone(fakeData) };
        });
        const expected = structuredClone(fakeData);
        expected.a1.mail!.lastPostCreated = newMsgs[0].data.created;
        expected.a1.mail!.lastUpdate = date.getTime();
        expected.a1.mail!.messages = [...newMsgs, ...oldMsgs] as RedditMessage[];
        expected.a1.error = null;
        expected.a1.auth.error = null;
        await storage.saveAccMessageData(fakeData.a1.id, {
            unreadMessages: structuredClone(newMsgs) as any as RedditMessage[],
        });
        expect(mockSet).toHaveBeenCalledWith({ accounts: expected });
        restoreDate();
    });

    test('should remove all messages from an account', async () => {
        const expected = structuredClone(fakeData);
        expected.a1.mail!.messages = [];
        expected.a2.mail!.messages = oldMsgs as RedditMessage[];
        mockGet.mockImplementation(async (keys) => {
            expect(keys).toMatchObject({ accounts: {} });
            return { accounts: structuredClone(fakeData) };
        });
        await storage.removeAccountMessages(fakeData.a1.id);
        expect(mockSet).toHaveBeenCalledWith({ accounts: expected });
    });

    test('should remove all messages from all accounts', async () => {
        const expected = structuredClone(fakeData);
        expected.a1.mail!.messages = [];
        expected.a2.mail!.messages = [];
        mockGet.mockImplementation(async (keys) => {
            expect(keys).toMatchObject({ accounts: {}, mail: {} });
            return { accounts: structuredClone(fakeData), mail: {} };
        });
        await storage.removeAllMessages();
        expect(mockSet).toHaveBeenCalledWith({ accounts: expected, mail: { messages: [] } });
    });

    test('should remove message', async () => {
        const expected = structuredClone(fakeData);
        const messageId = expected.a1.mail!.messages[0].data.id;
        const accountId = expected.a1.id;
        expected[accountId].mail!.messages = expected.a1.mail!.messages.slice(1);
        mockGet.mockImplementation(async (keys) => {
            expect(keys).toMatchObject({ accounts: {} });
            return { accounts: structuredClone(fakeData) };
        });
        await storage.removePost({ id: messageId, accountId });
        expect(mockSet).toHaveBeenCalledWith({ accounts: expected });
    });
});

describe('options', () => {
    const options: Partial<ExtensionOptions> = { updateInterval: 120 };

    beforeEach(() => {
        mockGet.mockImplementation(async (keys) => {
            expect(keys).toMatchObject({ options: DEFAULT_OPTIONS });
            return { options };
        });
    });

    test('should return options', async () => {
        const result = await storage.getOptions();
        expect(result).toMatchObject(options);
    });

    test('should save options', async () => {
        const newOptions: Partial<ExtensionOptions> = { hideEmptyGroups: true };
        await storage.saveOptions(newOptions);
        expect(mockSet).toHaveBeenCalledWith({ options: { ...options, ...newOptions } });
    });
});

describe('subreddits', () => {
    const subOpts: SubredditOpts[] = [
        { id: 'id1', subreddit: 'subname1', notify: true },
        { id: 'id2', subreddit: 'subname2', notify: false },
    ];
    const subreddits: Record<string, SubredditData> = {};

    beforeAll(() => {
        subOpts.forEach(({ id, subreddit }) => {
            subreddits[id] = { posts: generatePosts(2, subreddit) };
        });
    });

    test('should get and save the list of subreddits', async () => {
        const subredditList = [...subOpts];
        mockGet.mockImplementation(async (keys) => {
            expect(keys).toMatchObject({ subredditList: [] });
            return { subredditList };
        });
        await expect(storage.getSubredditList()).resolves.toBe(subredditList);

        vi.spyOn(storage, 'prune').mockImplementationOnce(() => Promise.resolve());

        await storage.saveSubredditList(subredditList);

        expect(storage.prune).toHaveBeenCalledWith({ subIdList: subredditList.map((s) => s.id) });
        vi.mocked(storage.prune).mockRestore();
    });

    test("should return subreddit's data with its posts", async () => {
        mockGet.mockImplementation(async (keys) => {
            expect(keys).toMatchObject({ subreddits: {} });
            return { subreddits };
        });
        const response = await storage.getSubredditData();
        expect(response).toEqual(subreddits);
    });

    test('should save new subreddit with options', async () => {
        const newSubreddit: SubredditOpts = { id: 'id', subreddit: 'newSub', disabled: false, notify: true };
        mockGet.mockImplementation(async (keys) => {
            expect(keys).toMatchObject({ subredditList: {} });
            return { subredditList: subOpts };
        });

        await storage.saveSubredditOpts(newSubreddit);
        expect(mockSet).toHaveBeenCalledWith({ subredditList: [...subOpts, newSubreddit] });
    });

    test('should remove subreddit list and data', async () => {
        const idsToRemove = [subOpts[1].id];
        mockGet.mockImplementation(async (keys) => {
            if (keys?.['subredditList']) {
                return { subredditList: subOpts };
            }
            if (keys?.['subreddits']) {
                return { subreddits };
            }
            throw new Error('unexpected keys');
        });
        const subData = structuredClone(subreddits);
        idsToRemove.forEach((id) => delete subData[id]);
        await storage.removeSubreddits(idsToRemove);
        expect(mockSet).toHaveBeenCalledWith({ subreddits: subData });
        expect(mockSet).toHaveBeenCalledWith({ subredditList: [subOpts[0]] });
    });

    test('should update subreddit opts', async () => {
        const updatedSub: SubredditOpts = {
            ...subOpts[1],
            subreddit: 'newSub',
            notify: !subOpts[1].notify,
            disabled: true,
        };
        const subData = structuredClone(subreddits);
        /* mockGet.expect({ subreddits: {} }).andResolve({ subreddits: subData }); */
        /* mockSet.expect({ subreddits: { ...subData, [updatedSub.id]: { posts: [] } } }); */
        mockGet.mockImplementation(async (keys) => {
            if (keys?.['subredditList']) {
                return { subredditList: subOpts };
            }
            if (keys?.['subreddits']) {
                return { subreddits: subData };
            }
            throw new Error('unexpected keys');
        });
        mockSet.mockImplementation(async () => {});
        await storage.saveSubredditOpts(updatedSub);
        expect(mockSet).toHaveBeenCalledWith({ subreddits: { ...subData, [updatedSub.id]: { posts: [] } } });
        expect(mockSet).toHaveBeenCalledWith({ subredditList: [subOpts[0], updatedSub, ...subOpts.slice(2)] });
    });

    test("should save subreddit's posts without duplication", async () => {
        const ts = Date.now();
        mockDate(ts);
        const { subreddit, id } = subOpts[0];
        const newPosts: RedditPost[] = [{ data: generatePost({ subreddit }) }, { data: generatePost({ subreddit }) }];
        const posts: RedditPost[] = [...newPosts, ...(subreddits[id].posts || [])];

        const expectedData: SubredditData = {
            error: null,
            lastPost: newPosts[0].data.name,
            lastPostCreated: newPosts[0].data.created,
            lastUpdate: ts,
            posts: [...newPosts, ...(subreddits[id].posts || [])],
        };

        mockGet.mockImplementation(async () => ({ subreddits }));
        await storage.saveSubredditData(id, { posts });
        expect(mockSet).toHaveBeenCalledWith({ subreddits: { ...subreddits, [id]: expectedData } });
        restoreDate();
    });

    test('should limit number of posts', async () => {
        const limit = 5;
        const posts = generatePosts(7);
        const subreddits = { sId: { posts: generatePosts(1) } };
        mockGet.mockImplementation(async () => ({ subreddits }));
        const expected = { sId: expect.objectContaining({ posts: posts.slice(0, limit) }) };
        await storage.saveSubredditData('sId', { posts, limit });
        expect(mockSet).toHaveBeenCalledWith({ subreddits: expected });
    });

    test('should save error', async () => {
        const error = { message: 'some error' };
        const sub: string = subOpts[1].subreddit;
        mockGet.mockImplementation(async () => ({ subreddits }));
        await storage.saveSubredditData(sub, { error });
        expect(mockSet).toHaveBeenCalledWith({
            subreddits: { ...subreddits, [sub]: expect.objectContaining({ error }) },
        });
    });

    test('should remove post', async () => {
        const { id: subId } = subOpts[0];
        const subs = structuredClone(subreddits);
        const postId = subs[subId].posts?.[1].data.id;
        const exp = expect.objectContaining({ posts: subreddits[subId].posts?.filter((p) => p.data.id !== postId) });
        mockGet.mockImplementation(async () => ({ subreddits: subs }));
        await storage.removePost({ id: postId!, subreddit: subId });
        expect(mockSet).toHaveBeenCalledWith({ subreddits: { ...subs, [subId]: exp } });
    });

    test('should remove all posts in subreddit', async () => {
        const { id } = subOpts[1];
        const subs = structuredClone(subreddits);
        const exp = expect.objectContaining({ posts: [] });
        mockGet.mockImplementation(async () => ({ subreddits: subs }));
        await storage.removePostsFrom({ subredditId: id });
        expect(mockSet).toHaveBeenCalledWith({ subreddits: { ...subs, [id]: exp } });
    });

    test('should remove all posts in all subreddits', async () => {
        const inputSubs = structuredClone(subreddits);
        const expectedSubs = {};
        subOpts.forEach(({ id }) => (expectedSubs[id] = { posts: [] }));
        mockGet.mockImplementation(async () => {
            return {
                subreddits: inputSubs,
                queries: {},
                usersList: [],
                accounts: {},
            } as Partial<StorageFields>;
        });
        vi.spyOn(storage, 'getQueriesData').mockImplementationOnce(() => Promise.resolve({}));

        await storage.removeAllPosts();
        expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ subreddits: expectedSubs }));

        vi.mocked(storage.getQueriesData).mockRestore();
    });
});

describe('search queries', () => {
    let queriesList: QueryOpts[];
    let qData: Record<string, QueryData>;

    const mockQueries = () =>
        mockGet.mockImplementation(async (keys) => {
            if (keys?.['queries']) {
                return { queries: structuredClone(qData) };
            }
            if (keys?.['queriesList']) {
                return { queriesList: structuredClone(queriesList) };
            }
            throw new Error('unexpected keys');
        });

    beforeAll(() => {
        queriesList = [generateQuery(), generateQuery()];
        qData = {};
        queriesList.forEach((q) => {
            qData[q.id] = { posts: generatePosts(2, q.subreddit) };
        });
    });

    test('should save search query data', async () => {
        const created = Date.now();
        mockDate(created + 1000);
        const posts: RedditPost[] = [
            { data: generatePost({ created }) },
            { data: generatePost({ created: created - 100 }) },
        ];
        const queryId = queriesList[0].id;
        const updated: QueryData = {
            error: null,
            lastPost: posts[0].data.name,
            lastPostCreated: created,
            lastUpdate: created + 1000,
            posts: [...posts, ...(qData[queryId].posts || [])],
        };
        mockQueries();
        await storage.saveQueryData(queryId, { posts });
        expect(mockSet).toHaveBeenCalledWith({ queries: expect.objectContaining({ [queryId]: updated }) });
        restoreDate();
    });

    test('should get the queries list', async () => {
        mockQueries();
        const qList = await storage.getQueriesList();
        expect(qList).toEqual(queriesList);
    });

    test('should save new query', async () => {
        const newQuery = generateQuery();
        mockQueries();
        await storage.saveQuery(newQuery);
        expect(mockSet).toHaveBeenCalledWith({ queriesList: [...queriesList, newQuery] });
    });

    test('should update query', async () => {
        const qId = queriesList[1].id;
        const updatedQuery: QueryOpts = { ...queriesList[1], query: 'new query' };
        const updatedList = [...queriesList.filter((q) => q.id !== qId), updatedQuery];
        mockQueries();
        await storage.saveQuery(updatedQuery);
        expect(mockSet).toHaveBeenCalledWith({ queries: { ...qData, [qId]: { posts: [] } } });
        expect(mockSet).toHaveBeenCalledWith({ queriesList: updatedList });
    });

    test('should remove query', async () => {
        const id = queriesList[1].id;
        const filtered = queriesList.filter((q) => q.id !== id);
        mockQueries();
        vi.spyOn(storage, 'prune').mockImplementationOnce(() => Promise.resolve());

        await storage.removeQueries([id]);
        expect(mockSet).toHaveBeenCalledWith({ queriesList: filtered });

        expect(storage.prune).toHaveBeenCalledWith({ queriesIdList: filtered.map((q) => q.id) });
        vi.mocked(storage.prune).mockRestore();
    });

    test('should remove post', async () => {
        mockQueries();
        const searchId = queriesList[1].id;
        const postId = qData[searchId].posts?.[1].data.id;
        const posts = qData[searchId].posts?.filter((p) => p.data.id !== postId);
        await storage.removePost({ id: postId!, searchId });
        expect(mockSet).toHaveBeenCalledWith({
            queries: expect.objectContaining({ [searchId]: { posts } }),
        });
    });

    test('should remove all posts in search query', async () => {
        const searchId = queriesList[0].id;
        mockQueries();
        await storage.removePostsFrom({ searchId });
        expect(mockSet).toHaveBeenCalledWith({
            queries: expect.objectContaining({ [searchId]: { posts: [] } }),
        });
    });

    test('should remove all posts in all search queries', async () => {
        mockGet.mockImplementationOnce(() =>
            Promise.resolve({
                subreddits: {},
                queries: structuredClone(qData),
                usersList: [],
                accounts: {},
            } as Partial<StorageFields>),
        );
        const expectedQueries = {};
        queriesList.forEach((q) => (expectedQueries[q.id] = { posts: [] }));
        vi.spyOn(storage, 'getSubredditData').mockImplementationOnce(() => Promise.resolve({}));
        await storage.removeAllPosts();
        expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ queries: expectedQueries }));
        vi.mocked(storage.getSubredditData).mockRestore();
    });
});

describe('prune', () => {
    const subInfo = { s1: { posts: [] }, s2: { posts: [] }, s3: { posts: [] }, s4: { posts: [] } };
    const queryInfo = { q1: { posts: [] }, q2: { posts: [] }, q3: { posts: [] } };

    beforeAll(() => {
        vi.spyOn(storage, 'getSubredditData').mockImplementation(async () => subInfo);
        vi.spyOn(storage, 'getQueriesData').mockImplementation(async () => queryInfo);
    });

    afterAll(() => {
        vi.mocked(storage.getSubredditData).mockRestore();
        vi.mocked(storage.getQueriesData).mockRestore();
    });

    test('should prune redundant subreddits', async () => {
        const subIdList = ['s1', 's2'];
        const subreddits = { s1: subInfo.s1, s2: subInfo.s2 };
        await storage.prune({ subIdList });
        expect(mockSet).toHaveBeenCalledWith({ subreddits });
    });

    test('should prune redundant queries data', async () => {
        vi.spyOn(storage, 'getQueriesData').mockImplementationOnce(async () => queryInfo);
        const queriesIdList = ['q2'];
        await storage.prune({ queriesIdList });
        expect(mockSet).toHaveBeenCalledWith({ queries: { q2: queryInfo.q2 } });
        vi.mocked(storage.getQueriesData).mockRestore();
    });
});

describe('Count unread', () => {
    const storageData = {
        subredditList: [
            { id: 'sid1', subreddit: 's1' },
            { id: 'sid2', subreddit: 's2' },
        ],
        subreddits: { sid1: { posts: generatePosts(3) }, sid2: {} } as StorageFields['subreddits'],
        queriesList: [generateQuery({ id: 'q1' }), generateQuery({ id: 'q2' }), generateQuery({ id: 'q3' })],
        queries: { q1: { posts: generatePosts(1) }, q2: { posts: [] }, q3: {} } as StorageFields['queries'],
        usersList: [{ username: 'u1', data: [{}, {}] }],
        options: DEFAULT_OPTIONS,
        mail: {
            messages: [
                { data: { id: 'm1', created: 1552338638 } },
                { data: { id: 'm2', created: 1552338630 } },
            ] as RedditMessage[],
        },
    } as StorageFields;

    storageData.accounts = {
        id1: { id: 'id1', auth: {}, mail: { messages: Array.from({ length: 3 }) as unknown as RedditMessage[] } },
        id2: { id: 'id2', auth: {}, mail: { messages: Array.from({ length: 2 }) as unknown as RedditMessage[] } },
    };

    const total = 3 + 1 + 2 + 2 + 3 + 2;

    test('should count unread items', async () => {
        vi.spyOn(storage, 'getAllData').mockImplementation(async () => storageData);
        vi.mocked(browser.action.setBadgeText).mockImplementationOnce(async (value) => {
            expect(value.text).toBe(total.toString());
        });
        await expect(storage.countNumberOfUnreadItems()).resolves.toBe(total);
        expect(browser.action.setBadgeText).toHaveBeenCalled();
        vi.mocked(storage.getAllData);
    });
});
