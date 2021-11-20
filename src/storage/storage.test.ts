/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */

import cloneDeep from 'lodash.clonedeep';
import DEFAULT_OPTIONS from '../options-default';
import type { RedditMessage, RedditMessageData, RedditPost } from '../reddit-api/reddit-types';
import { generatePost, generatePosts, generateQuery } from '../test-utils/content-generators';
import { mockDate, restoreDate } from '../test-utils/mock-date';
import type { ExtensionOptions } from '../types/extension-options';
import storage from './index';
import type { MessageData, QueryData, QueryOpts, StorageFields, SubredditData, SubredditOpts } from './storage-types';
import { generateId } from '../utils/index';
import { mocked } from 'ts-jest/utils';

jest.mock('../utils/index.ts', () => ({
    // @ts-ignore
    ...jest.requireActual('../utils/index.ts'),
    generateId: jest.fn(),
}));

const generateIdMock = mocked(generateId);

const mockGet = mockBrowser.storage.local.get;
const mockSet = mockBrowser.storage.local.set;

describe('authorization data', () => {
    afterEach(() => restoreDate());

    const accessToken = 'accessToken';
    const refreshToken = 'refreshToken';
    const expiresIn = 3600;
    const scope = 'scope';

    test('should save authorization data', async () => {
        const authDataFake = {
            access_token: accessToken,
            expires_in: String(expiresIn),
            refresh_token: refreshToken,
            token_type: 'tokenType',
            scope,
        };
        mockDate('2019-02-17T00:25:58.000Z');
        const expiresInAbsolute = new Date().getTime() + expiresIn * 1000;
        const expected = { accessToken, refreshToken, expiresIn: expiresInAbsolute, scope: 'scope' };
        mockSet.expect(expect.objectContaining(expected));
        await storage.saveAuthData(authDataFake);
    });

    test('should return authorization data', async () => {
        const result = { accessToken, refreshToken, expiresIn };
        const exp = expect.objectContaining({ accessToken: '', expiresIn: 0, refreshToken: '', scope: '' });
        mockGet.expect(exp).andResolve(result);
        await expect(storage.getAuthData()).resolves.toBe(result);
    });
});

describe('options', () => {
    const options: Partial<ExtensionOptions> = { updateInterval: 120 };

    beforeEach(() =>
        mockGet //
            .expect({ options: DEFAULT_OPTIONS })
            .andResolve({ options }),
    );

    test('should return options', async () => {
        const result = await storage.getOptions();
        expect(result).toMatchObject(options);
    });
    test('should save options', async () => {
        const newOptions: Partial<ExtensionOptions> = { hideEmptyGroups: true };
        mockSet.expect({ options: { ...options, ...newOptions } });
        await storage.saveOptions(newOptions);
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
    test('should migrate to v4', async () => {
        let id = 1;
        generateIdMock.mockImplementation(() => `id_${id++}`);

        const notify = true;
        const prevSubList = ['sub1', 'sub2'];
        const newSubList: Partial<SubredditOpts>[] = [
            { id: 'id_1', subreddit: 'sub1', notify },
            { id: 'id_2', subreddit: 'sub2', notify },
        ];
        const prevSubData: Record<string, SubredditData> = { sub2: { lastPost: 'postId' } };
        const newSubData = { id_2: { lastPost: 'postId' } };

        mockGet
            .expect({ options: {}, subredditList: [], subreddits: {} })
            .andResolve({ options: { subredditNotify: true }, subredditList: prevSubList, subreddits: prevSubData });

        mockSet.expect({ subredditList: newSubList, subreddits: newSubData });

        await storage.migrateToV4();
    });

    test('should get and save the list of subreddits', async () => {
        const subredditList = [...subOpts];
        mockGet.expect({ subredditList: [] }).andResolve({ subredditList: subredditList });
        await expect(storage.getSubredditList()).resolves.toBe(subredditList);

        mockSet.expect({ subredditList });
        jest.spyOn(storage, 'prune').mockImplementationOnce(() => Promise.resolve());

        await storage.saveSubredditList(subredditList);

        expect(storage.prune).toHaveBeenCalledWith({ subIdList: subredditList.map((s) => s.id) });
        (storage.prune as any as jest.SpyInstance).mockRestore();
    });

    test("should return subreddit's data with its posts", async () => {
        mockGet.expect({ subreddits: {} }).andResolve({ subreddits });
        const response = await storage.getSubredditData();
        expect(response).toEqual(subreddits);
    });

    test('should save new subreddit with options', async () => {
        const newSubreddit: SubredditOpts = { id: 'id', subreddit: 'newSub', disabled: false, notify: true };
        mockGet.expect({ subredditList: [] }).andResolve({ subredditList: subOpts });
        mockSet.expect({ subredditList: [...subOpts, newSubreddit] });
        await storage.saveSubredditOpts(newSubreddit);
    });

    test('should remove subreddit list and data', async () => {
        const idsToRemove = [subOpts[1].id];
        mockGet.expect({ subredditList: [] }).andResolve({ subredditList: subOpts });
        mockGet.expect({ subreddits: {} }).andResolve({ subreddits });
        const subData = cloneDeep(subreddits);
        idsToRemove.forEach((id) => delete subData[id]);
        mockSet.expect({ subreddits: subData });
        mockSet.expect({ subredditList: [subOpts[0]] });
        await storage.removeSubreddits(idsToRemove);
    });

    test('should update subreddit opts', async () => {
        const updatedSub: SubredditOpts = {
            ...subOpts[1],
            subreddit: 'newSub',
            notify: !subOpts[1].notify,
            disabled: true,
        };
        mockGet.expect({ subredditList: [] }).andResolve({ subredditList: subOpts });
        mockSet.expect({ subredditList: [subOpts[0], updatedSub, ...subOpts.slice(2)] });

        const subData = cloneDeep(subreddits);
        mockGet.expect({ subreddits: {} }).andResolve({ subreddits: subData });
        mockSet.expect({ subreddits: { ...subData, [updatedSub.id]: { posts: [] } } });

        await storage.saveSubredditOpts(updatedSub);
    });

    test("should save subreddit's posts without duplication", async () => {
        const ts = Date.now();
        mockDate(ts);
        const { subreddit, id } = subOpts[0];
        const newPosts: RedditPost[] = [{ data: generatePost({ subreddit }) }, { data: generatePost({ subreddit }) }];
        const posts: RedditPost[] = [...newPosts, ...subreddits[id].posts];

        const expectedData: SubredditData = {
            error: null,
            lastPost: newPosts[0].data.name,
            lastPostCreated: newPosts[0].data.created,
            lastUpdate: ts,
            posts: [...newPosts, ...subreddits[id].posts],
        };

        mockGet.mock(() => Promise.resolve({ subreddits }));
        mockSet.expect({ subreddits: { ...subreddits, [id]: expectedData } });

        await storage.saveSubredditData(id, { posts });
        restoreDate();
    });

    test('should limit number of posts', async () => {
        const limit = 5;
        const posts = generatePosts(7);
        const subreddits = { sId: { posts: generatePosts(1) } };
        mockGet.mock(() => Promise.resolve({ subreddits }));
        const expected = { sId: expect.objectContaining({ posts: posts.slice(0, limit) }) };
        mockSet.expect({ subreddits: expected });
        await storage.saveSubredditData('sId', { posts, limit });
    });

    test('should save error', async () => {
        const error = { message: 'some error' };
        const sub: string = subOpts[1].subreddit;
        mockGet.mock(() => Promise.resolve({ subreddits }));
        mockSet.expect({
            subreddits: { ...subreddits, [sub]: expect.objectContaining({ error }) },
        });
        await storage.saveSubredditData(sub, { error });
    });

    test('should remove post', async () => {
        const { id: subId } = subOpts[0];
        const subs = cloneDeep(subreddits);
        const postId = subs[subId].posts[1].data.id;
        const exp = expect.objectContaining({ posts: subreddits[subId].posts.filter((p) => p.data.id !== postId) });
        mockGet.mock(() => Promise.resolve({ subreddits: subs }));
        mockSet.expect({ subreddits: { ...subs, [subId]: exp } });
        await storage.removePost({ id: postId, subreddit: subId });
    });

    test('should remove all posts in subreddit', async () => {
        const { id } = subOpts[1];
        const subs = cloneDeep(subreddits);
        const exp = expect.objectContaining({ posts: [] });
        mockGet.mock(() => Promise.resolve({ subreddits: subs }));
        mockSet.expect({ subreddits: { ...subs, [id]: exp } });
        await storage.removePostsFrom({ subredditId: id });
    });

    test('should remove all posts in all subreddits', async () => {
        const inputSubs = cloneDeep(subreddits);
        const expectedSubs = {};
        subOpts.forEach(({ id }) => (expectedSubs[id] = { posts: [] }));
        mockGet.mock(() =>
            Promise.resolve({
                subreddits: inputSubs,
                queries: {},
                usersList: [],
            } as StorageFields),
        );
        mockSet.expect(expect.objectContaining({ subreddits: expectedSubs }));
        jest.spyOn(storage, 'getQueriesData').mockImplementationOnce(() => Promise.resolve({}));

        await storage.removeAllPosts();

        (storage.getQueriesData as any as jest.SpyInstance).mockRestore();
    });
});

describe('search queries', () => {
    let queriesList: QueryOpts[];
    let qData: Record<string, QueryData>;

    const mockQueries = () => mockGet.expect({ queries: {} }).andResolve({ queries: cloneDeep(qData) });
    const mockQueriesList = () => mockGet.expect({ queriesList: [] }).andResolve({ queriesList });

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
        mockSet.expect({ queries: expect.objectContaining({ [queryId]: updated }) });
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
        mockSet.expect({ queriesList: [...queriesList, newQuery] });
        await storage.saveQuery(newQuery);
    });

    test('should update query', async () => {
        const qId = queriesList[1].id;
        const updatedQuery: QueryOpts = { ...queriesList[1], query: 'new query' };
        const updatedList = [...queriesList.filter((q) => q.id !== qId), updatedQuery];
        mockQueriesList();
        mockQueries();
        mockSet.expect({ queries: { ...qData, [qId]: { posts: [] } } });
        mockSet.expect({ queriesList: updatedList });
        await storage.saveQuery(updatedQuery);
    });

    test('should remove query', async () => {
        const id = queriesList[1].id;
        const filtered = queriesList.filter((q) => q.id !== id);
        mockQueriesList();
        mockSet.expect({ queriesList: filtered });
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
        mockSet.expect({
            queries: expect.objectContaining({ [searchId]: { posts } }),
        });
        await storage.removePost({ id: postId, searchId });
    });

    test('should remove all posts in search query', async () => {
        const searchId = queriesList[0].id;
        mockQueries();
        mockSet.expect({
            queries: expect.objectContaining({
                [searchId]: { posts: [] },
            }),
        });
        await storage.removePostsFrom({ searchId });
    });

    test('should remove all posts in all search queries', async () => {
        mockGet.mock(() =>
            Promise.resolve({
                subreddits: {},
                queries: cloneDeep(qData),
                usersList: [],
            } as StorageFields),
        );
        const expectedQueries = {};
        queriesList.forEach((q) => (expectedQueries[q.id] = { posts: [] }));
        mockSet.expect(expect.objectContaining({ queries: expectedQueries }));
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
        mockGet.expect({ messages: {} }).andResolve({
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
        mockSet.expect({ messages: expected });
        const newMessages = cloneDeep(newMsgs) as any as RedditMessage[];
        await storage.saveMessageData({ newMessages, count });
        restoreDate();
    });
    test('should remove messages', async () => {
        mockSet.expect({ messages: { messages: [], count: 0 } });
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
        const subIdList = ['s1', 's2'];
        const subreddits = { s1: subInfo.s1, s2: subInfo.s2 };
        mockSet.expect({ subreddits });
        await storage.prune({ subIdList });
    });

    test('should prune redundant queries data', async () => {
        storage.getQueriesData = jest.fn(async () => queryInfo);
        const queriesIdList = ['q2'];
        mockSet.expect({
            queries: { q2: queryInfo.q2 },
        });
        await storage.prune({ queriesIdList });
    });
});

describe('Count unread', () => {
    const storageData = {
        subredditList: [
            { id: 'sid1', subreddit: 's1' },
            { id: 'sid2', subreddit: 's2' },
        ],
        subreddits: { sid1: { posts: generatePosts(3) }, sid2: {} },
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
