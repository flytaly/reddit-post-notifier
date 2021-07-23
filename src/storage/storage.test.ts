/* eslint-disable @typescript-eslint/unbound-method */

import cloneDeep from 'lodash.clonedeep';
import DEFAULT_OPTIONS from '../options-default';
import type { RedditPost } from '../reddit-api/reddit-types';
import { generatePost } from '../test-utils/content-generators';
import { mockDate, restoreDate } from '../test-utils/mock-date';
import type { ExtensionOptions } from '../types/env';
import storage from './index';
import type { SubredditData } from './storage-types';

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
            const posts: RedditPost[] = Array(2)
                .fill(null)
                .map(() => ({ data: generatePost({ subreddit }) }));
            subreddits[subreddit] = { posts };
        });
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
        await storage.removeAllPosts();
    });
});

// describe('search queries', () => {
//     const queriesList = [
//         {
//             id: 'id1',
//             name: 'name1',
//             query: 'search_query1',
//             subreddit: 'subreddit1',
//         },
//         {
//             id: 'id2',
//             name: 'name2',
//             query: 'search_query2',
//             subreddit: 'subreddit2',
//         },
//     ];
//     const queries = {
//         id1: { posts: [{ data: { id: 'postId_11' } }] },
//         id2: {
//             posts: [{ data: { id: 'postId_21' } }, { data: { id: 'postId_22' } }, { data: { id: 'postId_23' } }],
//         },
//     };

//     test('should return queries list', async () => {
//         browser.storage.local.get.callsFake(async (arg) => {
//             expect(arg).toEqual({ queriesList: [] });
//             return { queriesList };
//         });

//         const qList = await storage.getQueriesList();
//         expect(qList).toEqual(queriesList);
//     });

//     test('should save new query', async () => {
//         const newQuery = {
//             id: 'id3',
//             name: 'name3',
//             query: 'search_query3',
//             subreddit: 'subreddit3',
//         };
//         browser.storage.local.set.callsFake(async (arg) => {
//             expect(arg).toEqual({ queriesList: [...queriesList, newQuery] });
//         });
//         await storage.saveQuery(newQuery);
//     });

//     test('should update query', async () => {
//         const updateQuery = {
//             id: 'id2',
//             name: 'new_name2',
//             query: 'new_search_query2',
//             subreddit: 'subreddit2',
//         };
//         browser.storage.local.set.callsFake(async (arg) => {
//             expect(arg).toEqual({ queriesList: [queriesList[0], updateQuery] });
//         });
//         await storage.saveQuery(updateQuery);
//     });

//     test('should remove query', async () => {
//         browser.storage.local.set.callsFake(async (arg) => {
//             expect(arg).toEqual({ queriesList: [queriesList[1]] });
//         });
//         await storage.removeQueries([queriesList[0].id]);
//     });

//     test('should save search query data', async () => {
//         const queryId = 'id1';
//         const posts = [
//             { data: { id: 'postId6', created: '1552338638' } },
//             { data: { id: 'postId7', created: '1552338630' } },
//         ];

//         browser.storage.local.get.callsFake(async (arg) => {
//             expect(arg).toEqual({ queries: {} });
//             return { queries: cloneDeep(queries) };
//         });
//         browser.storage.local.set.callsFake(async (arg) => {
//             expect(arg.queries[queryId].lastPostCreated).toEqual('1552338638');
//             expect(arg.queries[queryId].posts).toEqual([...posts, ...queries[queryId].posts]);
//         });

//         await storage.saveQueryData(queryId, { posts });
//     });

//     test('should remove post', async () => {
//         browser.storage.local.get.callsFake(async (param) => {
//             expect(param).toEqual({ queries: {} });
//             return { queries: cloneDeep(queries) };
//         });
//         const searchId = 'id2';
//         const deletePostIndex = 1;
//         browser.storage.local.set.callsFake(async (param) => {
//             const { posts } = param.queries[searchId];
//             expect(posts).toEqual(queries[searchId].posts.filter((value, idx) => idx !== deletePostIndex));
//         });
//         await storage.removePost({ id: queries[searchId].posts[deletePostIndex].data.id, searchId });
//     });

//     test('should remove all posts in search query', async () => {
//         const searchId = 'id2';
//         browser.storage.local.set.callsFake(async (param) => {
//             const { posts } = param.queries[searchId];
//             expect(posts).toEqual([]);
//         });
//         await storage.removePostsFrom({ searchId });
//     });

//     test('should remove all posts in all search queries', async () => {
//         browser.storage.local.get.callsFake(() => ({ queries: cloneDeep(queries) }));
//         browser.storage.local.set.callsFake(async (param) => {
//             Object.keys(param.queries).forEach((q) => expect(param.queries[q].posts).toEqual([]));
//         });
//         await storage.removeAllPosts();
//     });
// });

// describe('messages', () => {
//     const oldMessages = [{ data: { created: '1552338638' } }, { data: { created: '1552338630' } }];
//     const newMessages = [{ data: { created: '1552339005' } }, { data: { created: '1552339000' } }];

//     test('should return information about unread messages', async () => {
//         browser.storage.local.get.callsFake(async (param) => {
//             expect(param).toEqual({ messages: {} });
//             return { messages: { messages: cloneDeep(oldMessages) } };
//         });
//         const messagesData = await storage.getMessageData();
//         expect(messagesData.messages).toEqual(oldMessages);
//     });

//     test('should save private messages and total number of unread messages', async () => {
//         browser.storage.local.set.callsFake(async ({ messages }) => {
//             expect(messages.count).toBe(4);
//             expect(messages.lastPostCreated).toBe(newMessages[0].data.created);
//             expect(messages.messages).toEqual([...newMessages, ...oldMessages]);
//         });

//         await storage.saveMessageData({ newMessages, count: 4 });
//     });
// });

// describe('V3 migration', () => {
//     test('should move list of subreddits outside options object', async () => {
//         const watchSubreddits = ['sub1', 'sub2'];
//         const options = {
//             someKey1: 'value1',
//             someKey2: 'value2',
//             watchSubreddits,
//         };

//         storage.getOptions = jest.fn(() => Promise.resolve(options));
//         storage.getSubredditList = jest.fn(() => Promise.resolve([]));

//         let saved = false;
//         browser.storage.local.set.callsFake((args) => {
//             expect(args.subredditList).toEqual(watchSubreddits);
//             expect(args.options).toMatchObject({
//                 someKey1: 'value1',
//                 someKey2: 'value2',
//             });
//             expect(args.options.watchSubreddits).toBeUndefined();
//             saved = true;
//         });

//         await storage.migrateToV3();
//         expect(saved).toBeTruthy();
//     });
// });

// describe('prune', () => {
//     const subInfo = {
//         sub1: { posts: [] },
//         sub2: { posts: [] },
//         sub3: { posts: [] },
//         sub4: { posts: [] },
//     };
//     const queryInfo = {
//         q1: { posts: [] },
//         q2: { posts: [] },
//         q3: { posts: [] },
//     };
//     beforeAll(() => {
//         storage.prune = pruneOriginal;
//     });
//     afterAll(() => {
//         storage.prune = jest.fn();
//     });
//     test('should prune redundant subreddits', async () => {
//         storage.getSubredditData = jest.fn(async () => subInfo);
//         browser.storage.local.set.callsFake(async (arg) => {
//             expect(arg).toEqual({ subreddits: { sub1: subInfo.sub1, sub2: subInfo.sub2 } });
//         });
//         const subredditList = ['sub1', 'sub2'];
//         await storage.prune({ subredditList });
//     });

//     test('should prune redundant queries data', async () => {
//         storage.getQueriesData = jest.fn(async () => queryInfo);
//         let called = false;
//         browser.storage.local.set.callsFake(async (arg) => {
//             expect(arg).toEqual({ queries: { q2: queryInfo.q2 } });
//             called = true;
//         });
//         const queriesIdList = ['q2'];
//         await storage.prune({ queriesIdList });
//         expect(called).toBeTruthy();
//     });
// });
