/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */

import cloneDeep from 'lodash.clonedeep';
import DEFAULT_OPTIONS from '../options-default';
import type { RedditMessage, RedditMessageData, RedditPost } from '../reddit-api/reddit-types';
import { generatePost, generatePosts, generateQuery } from '../test-utils/content-generators';
import { mockDate, restoreDate } from '../test-utils/mock-date';
import type { ExtensionOptions } from '../types/env';
import storage from './index';
import type { MessageData, QueryData, QueryOpts, StorageFields, SubredditData } from './storage-types';

describe('authorization data', () => {
    afterEach(() => restoreDate());

    const accessToken = 'accessToken';
    const refreshToken = 'refreshToken';
    const expiresIn = 3600;

    test('should save authorization data', async () => {
        const authDataFake = {
            access_token: accessToken,
            expires_in: expiresIn,
            refresh_token: refreshToken,
            token_type: 'tokenType',
            scope: 'scope',
        };
        mockDate('2019-02-17T00:25:58.000Z');
        const expiresInAbsolute = new Date().getTime() + expiresIn * 1000;
        const expected = { accessToken, refreshToken, expiresIn: expiresInAbsolute };
        mockBrowser.storage.local.set.expect(expect.objectContaining(expected));
        await storage.saveAuthData(authDataFake);
    });

    test('should return authorization data', async () => {
        const result = { accessToken, refreshToken, expiresIn };
        const exp = expect.objectContaining({ accessToken: '', expiresIn: 0, refreshToken: '' });
        mockBrowser.storage.local.get.expect(exp).andResolve(result);
        await expect(storage.getAuthData()).resolves.toBe(result);
    });
});

describe('options', () => {
    const options: Partial<ExtensionOptions> = { isAuthorized: true, updateInterval: 120 };

    beforeEach(() =>
        mockBrowser.storage.local.get //
            .expect({ options: DEFAULT_OPTIONS })
            .andResolve({ options }),
    );

    test('should return options', async () => {
        const result = await storage.getOptions();
        expect(result).toMatchObject(options);
    });
    test('should save options', async () => {
        const newOptions: Partial<ExtensionOptions> = { hideEmptyGroups: true };
        mockBrowser.storage.local.set.expect({ options: { ...options, ...newOptions } });
        await storage.saveOptions(newOptions);
    });
});

describe('subreddits', () => {
    const subNames = ['subname1', 'subname2'];
    const subreddits: Record<string, SubredditData> = {};

    beforeAll(() => {
        subNames.forEach((subreddit) => {
            subreddits[subreddit] = { posts: generatePosts(2, subreddit) };
        });
    });

    test('should get and save the list of subreddits', async () => {
        const subredditList = [...subNames];
        mockBrowser.storage.local.get.expect({ subredditList: [] }).andResolve({ subredditList: subredditList });
        await expect(storage.getSubredditList()).resolves.toBe(subredditList);

        mockBrowser.storage.local.set.expect({ subredditList });
        jest.spyOn(storage, 'prune').mockImplementationOnce(() => Promise.resolve());

        await storage.saveSubredditList(subredditList);

        expect(storage.prune).toHaveBeenCalledWith({ subredditList });
        (storage.prune as any as jest.SpyInstance).mockRestore();
    });

    test("should return subreddit's data with its posts", async () => {
        mockBrowser.storage.local.get.expect({ subreddits: {} }).andResolve({ subreddits });
        const response = await storage.getSubredditData();
        expect(response).toEqual(subreddits);
    });

    test("should save subreddit's posts without duplication", async () => {
        const ts = Date.now();
        mockDate(ts);
        const subreddit = subNames[0];
        const newPosts: RedditPost[] = [{ data: generatePost({ subreddit }) }, { data: generatePost({ subreddit }) }];
        const posts: RedditPost[] = [...newPosts, ...subreddits[subreddit].posts];

        const expectedData: SubredditData = {
            error: null,
            lastPost: newPosts[0].data.name,
            lastPostCreated: newPosts[0].data.created,
            lastUpdate: ts,
            posts: [...newPosts, ...subreddits[subreddit].posts],
        };

        mockBrowser.storage.local.get.mock(() => Promise.resolve({ subreddits }));
        mockBrowser.storage.local.set.expect({ subreddits: { ...subreddits, [subreddit]: expectedData } });

        await storage.saveSubredditData(subreddit, { posts });
        restoreDate();
    });

    test('should save error', async () => {
        const error = { message: 'some error' };
        const sub = subNames[1];
        mockBrowser.storage.local.get.mock(() => Promise.resolve({ subreddits }));
        mockBrowser.storage.local.set.expect({
            subreddits: { ...subreddits, [sub]: expect.objectContaining({ error }) },
        });
        await storage.saveSubredditData(sub, { error });
    });

    test('should remove post', async () => {
        const sub = subNames[0];
        const subs = cloneDeep(subreddits);
        const id = subs[sub].posts[1].data.id;
        const exp = expect.objectContaining({ posts: subreddits[sub].posts.filter((p) => p.data.id !== id) });
        mockBrowser.storage.local.get.mock(() => Promise.resolve({ subreddits: subs }));
        mockBrowser.storage.local.set.expect({ subreddits: { ...subs, [sub]: exp } });
        await storage.removePost({ id, subreddit: sub });
    });

    test('should remove all posts in subreddit', async () => {
        const subreddit = subNames[1];
        const subs = cloneDeep(subreddits);
        const exp = expect.objectContaining({ posts: [] });
        mockBrowser.storage.local.get.mock(() => Promise.resolve({ subreddits: subs }));
        mockBrowser.storage.local.set.expect({ subreddits: { ...subs, [subreddit]: exp } });
        await storage.removePostsFrom({ subreddit });
    });

    test('should remove all posts in all subreddits', async () => {
        const inputSubs = cloneDeep(subreddits);
        const expectedSubs = {};
        subNames.forEach((s) => (expectedSubs[s] = { posts: [] }));
        mockBrowser.storage.local.get.mock(() => Promise.resolve({ subreddits: inputSubs }));
        mockBrowser.storage.local.set.expect(expect.objectContaining({ subreddits: expectedSubs }));
        jest.spyOn(storage, 'getQueriesData').mockImplementationOnce(() => Promise.resolve({}));

        await storage.removeAllPosts();

        (storage.getQueriesData as any as jest.SpyInstance).mockRestore();
    });
});

describe('search queries', () => {
    let queriesList: QueryOpts[];
    let qData: Record<string, QueryData>;

    const mockQueries = () =>
        mockBrowser.storage.local.get.expect({ queries: {} }).andResolve({ queries: cloneDeep(qData) });
    const mockQueriesList = () => mockBrowser.storage.local.get.expect({ queriesList: [] }).andResolve({ queriesList });

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
            posts: [...posts, ...qData[queryId].posts],
        };
        mockQueries();
        mockBrowser.storage.local.set.expect({ queries: expect.objectContaining({ [queryId]: updated }) });
        await storage.saveQueryData(queryId, { posts });
        restoreDate();
    });

    test('should get the queries list', async () => {
        mockQueriesList();
        const qList = await storage.getQueriesList();
        expect(qList).toEqual(queriesList);
    });

    test('should save new query', async () => {
        const newQuery = generateQuery();
        mockQueriesList();
        mockBrowser.storage.local.set.expect({ queriesList: [...queriesList, newQuery] });
        await storage.saveQuery(newQuery);
    });

    test('should update query', async () => {
        const qId = queriesList[1].id;
        const updatedQuery: QueryOpts = { ...queriesList[1], query: 'new query' };
        const updatedList = [...queriesList.filter((q) => q.id !== qId), updatedQuery];
        mockQueriesList();
        mockQueries();
        mockBrowser.storage.local.set.expect({ queries: { ...qData, [qId]: { posts: [] } } });
        mockBrowser.storage.local.set.expect({ queriesList: updatedList });
        await storage.saveQuery(updatedQuery);
    });

    test('should remove query', async () => {
        const id = queriesList[1].id;
        const filtered = queriesList.filter((q) => q.id !== id);
        mockQueriesList();
        mockBrowser.storage.local.set.expect({ queriesList: filtered });
        jest.spyOn(storage, 'prune').mockImplementationOnce(() => Promise.resolve());

        await storage.removeQueries([id]);

        expect(storage.prune).toHaveBeenCalledWith({ queriesIdList: filtered.map((q) => q.id) });
        (storage.prune as any as jest.SpyInstance).mockRestore();
    });

    test('should remove post', async () => {
        mockQueries();
        const searchId = queriesList[1].id;
        const postId = qData[searchId].posts[1].data.id;
        const posts = qData[searchId].posts.filter((p) => p.data.id !== postId);
        mockBrowser.storage.local.set.expect({
            queries: expect.objectContaining({ [searchId]: { posts } }),
        });
        await storage.removePost({ id: postId, searchId });
    });

    test('should remove all posts in search query', async () => {
        const searchId = queriesList[0].id;
        mockQueries();
        mockBrowser.storage.local.set.expect({
            queries: expect.objectContaining({
                [searchId]: { posts: [] },
            }),
        });
        await storage.removePostsFrom({ searchId });
    });

    test('should remove all posts in all search queries', async () => {
        mockQueries();
        const expectedQueries = {};
        queriesList.forEach((q) => (expectedQueries[q.id] = { posts: [] }));
        mockBrowser.storage.local.set.expect(expect.objectContaining({ queries: expectedQueries }));
        jest.spyOn(storage, 'getSubredditData').mockImplementationOnce(() => Promise.resolve({}));
        await storage.removeAllPosts();
        (storage.getSubredditData as any as jest.SpyInstance).mockRestore();
    });
});

describe('messages', () => {
    type PartialMsg = { data: Partial<RedditMessageData> };
    const oldMsgs: PartialMsg[] = [{ data: { created: 1552338638 } }, { data: { created: 1552338630 } }];
    const newMsgs: PartialMsg[] = [{ data: { created: 1552339005 } }, { data: { created: 1552339000 } }];

    beforeEach(() => {
        const msgArray = cloneDeep(oldMsgs);
        mockBrowser.storage.local.get.expect({ messages: {} }).andResolve({
            messages: { count: msgArray.length, messages: msgArray } as MessageData,
        });
    });
    test('should return information about unread messages', async () => {
        await expect(storage.getMessageData()).resolves.toEqual({
            count: oldMsgs.length,
            messages: oldMsgs,
        });
    });

    test('should save private messages and total number of unread messages', async () => {
        const count = oldMsgs.length + newMsgs.length;
        const date = mockDate(new Date());
        const expected: MessageData = {
            count,
            lastPostCreated: newMsgs[0].data.created,
            lastUpdate: date.getTime(),
            messages: expect.arrayContaining([...newMsgs, ...oldMsgs]) as RedditMessage[],
        };
        mockBrowser.storage.local.set.expect({ messages: expected });
        const newMessages = cloneDeep(newMsgs) as any as RedditMessage[];
        await storage.saveMessageData({ newMessages, count });
        restoreDate();
    });
    test('should remove messages', async () => {
        mockBrowser.storage.local.set.expect({ messages: { messages: [], count: 0 } });
        await storage.removeMessages();
    });
});

describe('prune', () => {
    const subInfo = { s1: { posts: [] }, s2: { posts: [] }, s3: { posts: [] }, s4: { posts: [] } };
    const queryInfo = { q1: { posts: [] }, q2: { posts: [] }, q3: { posts: [] } };

    beforeAll(() => {
        jest.spyOn(storage, 'getSubredditData').mockImplementation(() => Promise.resolve(subInfo));
        jest.spyOn(storage, 'getQueriesData').mockImplementation(() => Promise.resolve(queryInfo));
    });
    afterAll(() => {
        (storage.getSubredditData as any as jest.SpyInstance).mockRestore();
        (storage.getQueriesData as any as jest.SpyInstance).mockRestore();
    });

    test('should prune redundant subreddits', async () => {
        const subredditList = ['s1', 's2'];
        const subreddits = { s1: subInfo.s1, s2: subInfo.s2 };
        mockBrowser.storage.local.set.expect({ subreddits });
        await storage.prune({ subredditList });
    });

    test('should prune redundant queries data', async () => {
        storage.getQueriesData = jest.fn(async () => queryInfo);
        const queriesIdList = ['q2'];
        mockBrowser.storage.local.set.expect({
            queries: { q2: queryInfo.q2 },
        });
        await storage.prune({ queriesIdList });
    });
});

describe('Count unread', () => {
    const storageData = {
        subredditList: ['s1', 's2'],
        subreddits: { s1: { posts: generatePosts(3) }, s2: {} },
        queriesList: [generateQuery({ id: 'q1' }), generateQuery({ id: 'q2' }), generateQuery({ id: 'q3' })],
        queries: { q1: { posts: generatePosts(1) }, q2: { posts: [] }, q3: {} },
        messages: { count: 3 },
    } as any as StorageFields;
    const total = 3 + 1 + 3;

    test('should count unread items', async () => {
        jest.spyOn(storage, 'getAllData').mockImplementation(() => Promise.resolve(storageData));
        mockBrowser.browserAction.setBadgeText.expect({ text: String(total) });
        await expect(storage.countNumberOfUnreadItems()).resolves.toBe(total);
        (storage.getAllData as any as jest.SpyInstance).mockRestore();
    });
});
