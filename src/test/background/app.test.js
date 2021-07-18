import storage from '../../scripts/storage';
import './mocks/browser.mock';
import app from '../../scripts/background/app';
import { wait } from '../../scripts/utils';

jest.mock(
    '../../scripts/background/api-client.js',
    () =>
        class RedditApiClient {
            constructor() {
                global.redditClientInstance = this;
                return this;
            }
        },
);
jest.mock('../../scripts/utils.js', () => ({ wait: jest.fn() }));
jest.mock('../../scripts/storage.js');

const created = 1551733803;
const options = {
    updateInterval: 1,
    messages: false,
};
const fakeData = {
    subredditList: ['sub1', 'sub2', 'sub3'],
    queriesList: [{ id: 'id1', query: 'query1' }],
    queries: { id1: { lastPostCreated: created } },
    subreddits: {
        sub1: {
            lastPost: 'postId_1',
            lastPostCreated: created,
        },
        sub2: {
            lastPost: 'postId_2',
            lastPostCreated: created,
        },
        sub3: {
            lastPost: 'postId_3',
            lastPostCreated: created,
        },
    },
    messages: {
        messages: [{ data: { created } }],
        lastPostCreated: created,
        count: 1,
    },
};

const newPosts = [
    {
        data: {
            name: 'postId_4',
            created: created + 10,
        },
    },
    {
        data: {
            name: 'postId_5',
            created: created - 10,
        },
    },
];

let reddit;

beforeAll(() => {
    storage.getAllData = jest.fn(() => Promise.resolve(fakeData));
    storage.getOptions = jest.fn(() => Promise.resolve(options));
    reddit = global.redditClientInstance;
});

afterEach(() => jest.clearAllMocks());

describe('update posts', () => {
    test('should update and save new posts', async () => {
        const { subredditList } = fakeData;
        storage.saveSubredditData = jest.fn(async (sub, data) => {
            expect(subredditList.includes(sub)).toBeTruthy();
            expect(data).toEqual({ posts: newPosts.slice(0, 1) });
        });

        storage.saveQueryData = jest.fn(async (id, data) => {
            expect(data).toEqual({ posts: newPosts.slice(0, 1), error: null });
        });

        const getNewPost = jest.fn(async () => ({ kind: 'Listing', data: { children: newPosts } }));
        const getSearchPost = jest.fn(async () => ({ kind: 'Listing', data: { children: newPosts } }));

        reddit.getSubreddit = jest.fn(() => ({
            new: getNewPost,
            search: getSearchPost,
        }));
        reddit.search = getSearchPost;

        await app.update();
        expect(storage.getOptions).toHaveBeenCalled();
        // expect(storage.getSubredditData).toHaveBeenCalled();
        expect(reddit.getSubreddit).toHaveBeenCalledTimes(subredditList.length);
        for (const [index /* , value */] of subredditList.entries()) {
            expect(getNewPost).toHaveBeenNthCalledWith(index + 1, { limit: 10 });
        }

        expect(wait).toHaveBeenCalledTimes(subredditList.length + fakeData.queriesList.length);
    });

    test("should save subreddit's error", async () => {
        const error = { reason: 'private', message: 'Forbidden', error: 403 };
        console.error = jest.fn();
        storage.saveSubredditData = jest.fn(async (sub, data) => {
            expect(data).toEqual({ error });
        });
        const getNewPost = jest.fn(async () => error);
        reddit.getSubreddit = jest.fn(() => ({ new: getNewPost }));
        await app.update();
    });
});

describe('update messages', () => {
    const newMessages = [{ data: { created: created + 10 } }];
    const { messages } = fakeData;
    const response = {
        kind: 'Listing',
        data: {
            children: [...newMessages, ...messages.messages],
        },
    };

    beforeAll(() => {
        storage.getOptions = jest.fn(async () => ({ ...options, messages: true }));
        storage.saveMessageData = jest.fn();
        storage.getAuthData = jest.fn(async () => ({ refreshToken: 'refreshToken' }));
        reddit.messages = { unread: jest.fn(async () => response) };
    });

    test('should update and save new private messages', async () => {
        await app.update();
        expect(storage.saveMessageData).toHaveBeenCalledWith({
            newMessages,
            count: messages.count + newMessages.length,
        });
    });

    test("should not call private messages updating if extension isn't authorized", async () => {
        storage.getAuthData.mockImplementationOnce(async () => ({
            refreshToken: null,
        }));
        storage.saveMessageData.mockClear();
        await app.update();
        expect(storage.saveMessageData).not.toHaveBeenCalled();
    });
});
