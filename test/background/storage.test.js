import browser from 'sinon-chrome/webextensions';
import cloneDeep from 'lodash.clonedeep';
import storage from '../../scripts/storage';

window.browser = browser;

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
        sub1: { posts: [{ data: { name: 'postId_11' } }], lastPost: 'postId_11' },
        sub2: { posts: [{ data: { name: 'postId_21' } }], lastPost: 'postId_21' },
    };

    beforeAll(() => {
        browser.storage.local.get.callsFake(async (param) => {
            expect(param).toEqual({ subreddits: {} });
            return { subreddits: cloneDeep(subreddits) };
        });
    });

    test('should return posts of all subreddits', async () => {
        const response = await storage.getSubredditData();
        expect(response).toEqual(subreddits);
    });

    test('should save subreddit\'s posts', async () => {
        const newPosts = [
            { data: { name: 'postId_13', created: '1551734739' } },
            { data: { name: 'postId_12', created: '1551734740' } },
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
});
