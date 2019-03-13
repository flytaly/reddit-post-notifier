import browser from 'sinon-chrome/webextensions';
import cloneDeep from 'lodash.clonedeep';
import storage from '../../scripts/storage';

global.browser = browser;

describe('authorization data', () => {
    const RealDate = Date;
    function mockDate(isoDate) {
        global.Date = class extends RealDate {
            constructor() {
                return new RealDate(isoDate);
            }
        };
    }
    afterEach(() => {
        global.Date = RealDate;
    });

    const accessToken = 'accessToken';
    const refreshToken = 'refreshToken';
    const expiresIn = 3600;

    test('should save authorization data', async () => {
        const authDataSnake = {
            access_token: accessToken,
            expires_in: expiresIn,
            refresh_token: refreshToken,
            token_type: 'tokenType',
            scope: 'scope',
        };
        browser.storage.local.set.callsFake(async data => data);
        mockDate('2019-02-17T00:25:58.000Z');
        const expiresInAbsolute = new Date().getTime() + expiresIn * 1000;
        const savedData = await storage.saveAuthData(authDataSnake);
        expect(savedData).toMatchObject({
            accessToken, refreshToken, expiresIn: expiresInAbsolute,
        });
    });

    test('should give authorization data', async () => {
        await storage.getAuthData();
        const keys = ['accessToken', 'expiresIn', 'refreshToken'];
        expect(browser.storage.local.get.calledOnceWith(keys)).toBeTruthy();
    });
});

describe('options', () => {
    const options = { option1: 1, option2: 2 };
    beforeAll(() => {
        browser.storage.local.get.callsFake(async (key) => {
            expect(key).toBe('options');
            return { options };
        });
    });
    test('should return options', async () => {
        const result = await storage.getOptions();
        expect(result).toEqual(options);
    });
    test('should save options', async () => {
        const newOptions = { newOption1: 'value1', newOption2: 'value2' };
        browser.storage.local.set.callsFake(async (opts) => {
            expect(opts.options).toEqual({ ...options, ...newOptions });
            return null;
        });
        await storage.saveOptions(newOptions);
    });
});

describe('subreddits', () => {
    const subreddits = {
        sub1: { posts: [{ data: { name: 'fullname_11', id: 'postId_11' } }], lastPost: 'fullname_11' },
        sub2: {
            posts: [
                { data: { name: 'fullname_21', id: 'postId_21' } },
                { data: { name: 'fullname_22', id: 'postId_22' } },
                { data: { name: 'fullname_23', id: 'postId_23' } },
            ],
            lastPost: 'fullname_21',
        },
    };

    beforeAll(() => {
        browser.storage.local.get.callsFake(async (param) => {
            if (!param.queries) expect(param.subreddits).toEqual({});
            return { subreddits: cloneDeep(subreddits) };
        });
    });

    test('should return posts of all subreddits', async () => {
        const response = await storage.getSubredditData();
        expect(response).toEqual(subreddits);
    });

    test('should save subreddit\'s posts', async () => {
        const newPosts = [
            { data: { name: 'fullname_13', created: '1551734739' } },
            { data: { name: 'fullname_12', created: '1551734740' } },
        ];

        browser.storage.local.set.callsFake(async (param) => {
            const subR = param.subreddits;
            expect(subR.sub2).toEqual(subreddits.sub2);

            const oldPosts = subreddits.sub1.posts;
            expect(subR.sub1.posts).toEqual([...newPosts, ...oldPosts]);
            expect(subR.sub1.lastPost).toBe(newPosts[0].data.name);
            expect(subR.sub1.lastPostCreated).toBe(newPosts[0].data.created);
        });

        await storage.saveSubredditData('sub1', { posts: newPosts });
    });

    test('should save error', async () => {
        const error = { message: 'some error' };
        browser.storage.local.set.callsFake(async (param) => {
            const subR = param.subreddits;
            expect(subR.sub1).toEqual(subreddits.sub1);
            expect(subR.sub2).toEqual(subreddits.sub2);
            expect(subR.sub3.error).toEqual(error);
        });

        await storage.saveSubredditData('sub3', { error });
    });

    test('should remove post', async () => {
        const subreddit = 'sub2';
        const deletePostIndex = 1;
        browser.storage.local.set.callsFake(async (param) => {
            const { posts } = param.subreddits[subreddit];
            expect(posts).toEqual(subreddits[subreddit].posts.filter((value, idx) => idx !== deletePostIndex));
        });
        await storage.removePost({ id: subreddits[subreddit].posts[deletePostIndex].data.id, subreddit });
    });

    test('should remove all posts in subreddit', async () => {
        const subreddit = 'sub2';
        browser.storage.local.set.callsFake(async (param) => {
            const { posts } = param.subreddits[subreddit];
            expect(posts).toEqual([]);
        });
        await storage.removePostsFrom({ subreddit });
    });

    test('should remove all posts in all subreddits', async () => {
        browser.storage.local.set.callsFake(async (param) => {
            Object
                .keys(param.subreddits)
                .forEach(subreddit => expect(param.subreddits[subreddit].posts).toEqual([]));
        });
        await storage.removeAllPosts();
    });
});

describe('prune', () => {
    const subInfo = {
        sub1: { posts: [] },
        sub2: { posts: [] },
        sub3: { posts: [] },
        sub4: { posts: [] },
    };
    test('should prune redundant subreddits', async () => {
        storage.getSubredditData = jest.fn(async () => subInfo);
        browser.storage.local.set.callsFake(async (arg) => {
            expect(arg).toEqual({ subreddits: { sub1: subInfo.sub1, sub2: subInfo.sub2 } });
        });
        const watchSubreddits = ['sub1', 'sub2'];
        await storage.prune({ watchSubreddits });
    });
});

describe('search queries', () => {
    const queriesList = [{
        id: 'id1', name: 'name1', query: 'search_query1', subreddit: 'subreddit1',
    }, {
        id: 'id2', name: 'name2', query: 'search_query2', subreddit: 'subreddit2',
    }];
    const queries = {
        id1: { posts: [{ data: { id: 'postId_11' } }] },
        id2: {
            posts: [
                { data: { id: 'postId_21' } },
                { data: { id: 'postId_22' } },
                { data: { id: 'postId_23' } },
            ],
        },
    };

    test('should return queries list', async () => {
        browser.storage.local.get.callsFake(async (arg) => {
            expect(arg).toEqual({ queriesList: [] });
            return { queriesList };
        });

        const qList = await storage.getQueriesList();
        expect(qList).toEqual(queriesList);
    });

    test('should save new query', async () => {
        const newQuery = {
            id: 'id3', name: 'name3', query: 'search_query3', subreddit: 'subreddit3',
        };
        browser.storage.local.set.callsFake(async (arg) => {
            expect(arg).toEqual({ queriesList: [...queriesList, newQuery] });
        });
        await storage.saveQuery(newQuery);
    });

    test('should update query', async () => {
        const updateQuery = {
            id: 'id2', name: 'new_name2', query: 'new_search_query2', subreddit: 'subreddit2',
        };
        browser.storage.local.set.callsFake(async (arg) => {
            expect(arg).toEqual({ queriesList: [queriesList[0], updateQuery] });
        });
        await storage.saveQuery(updateQuery);
    });

    test('should remove query', async () => {
        browser.storage.local.set.callsFake(async (arg) => {
            expect(arg).toEqual({ queriesList: [queriesList[1]] });
        });
        await storage.removeQueries([queriesList[0].id]);
    });

    test('should save search query data', async () => {
        const queryId = 'id1';
        const posts = [
            { data: { id: 'postId6', created: '1552338638' } },
            { data: { id: 'postId7', created: '1552338630' } },
        ];

        browser.storage.local.get.callsFake(async (arg) => {
            expect(arg).toEqual({ queries: {} });
            return { queries: cloneDeep(queries) };
        });
        browser.storage.local.set.callsFake(async (arg) => {
            expect(arg.queries[queryId].lastPostCreated).toEqual('1552338638');
            expect(arg.queries[queryId].posts).toEqual([...posts, ...queries[queryId].posts]);
        });


        await storage.saveQueryData(queryId, { posts });
    });

    test('should remove post', async () => {
        browser.storage.local.get.callsFake(async (param) => {
            expect(param).toEqual({ queries: {} });
            return { queries: cloneDeep(queries) };
        });
        const searchId = 'id2';
        const deletePostIndex = 1;
        browser.storage.local.set.callsFake(async (param) => {
            const { posts } = param.queries[searchId];
            expect(posts).toEqual(queries[searchId].posts.filter((value, idx) => idx !== deletePostIndex));
        });
        await storage.removePost({ id: queries[searchId].posts[deletePostIndex].data.id, searchId });
    });

    test('should remove all posts in search query', async () => {
        const searchId = 'id2';
        browser.storage.local.set.callsFake(async (param) => {
            const { posts } = param.queries[searchId];
            expect(posts).toEqual([]);
        });
        await storage.removePostsFrom({ searchId });
    });

    test('should remove all posts in all search queries', async () => {
        browser.storage.local.set.callsFake(async (param) => {
            Object
                .keys(param.queries)
                .forEach(q => expect(param.queries[q].posts).toEqual([]));
        });
        await storage.removeAllPosts();
    });
});

describe('messages', () => {
    const oldMessages = [
        { data: { created: '1552338638' } },
        { data: { created: '1552338630' } },
    ];
    const newMessages = [
        { data: { created: '1552339005' } },
        { data: { created: '1552339000' } },
    ];

    test('should return information about unread messages', async () => {
        browser.storage.local.get.callsFake(async (param) => {
            expect(param).toEqual({ messages: {} });
            return { messages: { messages: cloneDeep(oldMessages) } };
        });
        const messagesData = await storage.getMessageData();
        expect(messagesData.messages).toEqual(oldMessages);
    });

    test('should save private messages and total number of unread messages', async () => {
        // const messages =
        browser.storage.local.set.callsFake(async ({ messages }) => {
            expect(messages.count).toBe(4);
            expect(messages.lastPostCreated).toBe(newMessages[0].data.created);
            expect(messages.messages).toEqual([...newMessages, ...oldMessages]);
        });

        await storage.saveMessageData({ newMessages, count: 4 });
    });
});
