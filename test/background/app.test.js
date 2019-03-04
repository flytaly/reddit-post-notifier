import storage from '../../scripts/storage';
import app from '../../scripts/background/app';
import { wait } from '../../scripts/utils';

jest.mock('../../scripts/background/api-client.js', () => class RedditApiClient {
    constructor() {
        global.redditClientInstance = this;
        return this;
    }
});
jest.mock('../../scripts/utils.js', () => ({ wait: jest.fn() }));
jest.mock('../../scripts/storage.js');

const options = {
    watchSubreddits: ['sub1', 'sub2', 'sub3'],
    updateInterval: 1,
};

const subredditsData = {
    sub1: { lastPost: 'postId_1' },
    sub2: { lastPost: 'postId_2' },
    sub3: { lastPost: 'postId_3' },
};
const newPosts = [{ name: 'postId_4' }, { name: 'postId_5' }];
let reddit;

beforeAll(() => {
    storage.getOptions = jest.fn(async () => options);
    storage.getSubredditData = jest.fn(async () => subredditsData);
    reddit = global.redditClientInstance;
});

afterEach(() => jest.clearAllMocks());

describe('update', () => {
    test('should update and save new posts', async () => {
        storage.saveSubredditData = jest.fn(async (sub, data) => {
            expect(options.watchSubreddits.includes(sub)).toBeTruthy();
            expect(data).toEqual({ posts: newPosts });
        });

        const getNewPost = jest.fn(async () => ({ kind: 'Listing', data: { children: newPosts } }));

        reddit.getSubreddit = jest.fn(() => ({ new: getNewPost }));

        await app.update();
        expect(storage.getOptions).toHaveBeenCalled();
        expect(storage.getSubredditData).toHaveBeenCalled();
        expect(reddit.getSubreddit).toHaveBeenCalledTimes(options.watchSubreddits.length);
        for (const [index, value] of options.watchSubreddits.entries()) {
            expect(getNewPost).toHaveBeenNthCalledWith(index + 1, { before: subredditsData[value].lastPost });
        }
        expect(wait).toHaveBeenCalledTimes(options.watchSubreddits.length);
    });

    test('should save subreddit\'s error', async () => {
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
