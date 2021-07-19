import { userAgent } from '../../scripts/config';
import RedditApiClient from '../../scripts/background/api-client';
import auth from '../../scripts/background/auth';

jest.mock('../../scripts/background/auth.js');
const reddit = new RedditApiClient();

afterEach(() => jest.clearAllMocks());

describe('HTTP GET request', () => {
    const response = { data: 'data' };
    const endpoint = '/endpoint';
    const accessToken = 'accessToken';
    const params = { p1: 'v1', p2: 'v2' };
    auth.getAccessToken = jest.fn(async () => accessToken);

    test('should return JSON response', async () => {
        global.fetch = jest.fn(async (url, init) => {
            expect(init.method).toBe('GET');
            expect(init.headers['User-Agent']).toBe(userAgent);
            expect(init.headers.Authorization).toBe(`bearer ${accessToken}`);
            expect(url).toBe('https://oauth.reddit.com/endpoint?p1=v1&p2=v2&raw_json=1');

            return {
                json: jest.fn(async () => response),
            };
        });

        const result = await reddit.GET(endpoint, params);

        expect(result).toEqual(response);
    });

    test('should have correct url without params', async () => {
        global.fetch = jest.fn(async (url /* , init */) => {
            expect(url).toBe('https://oauth.reddit.com/endpoint?raw_json=1');
            return {
                json: jest.fn(async () => response),
            };
        });
        const result = await reddit.GET(endpoint);
        expect(result).toEqual(response);
    });

    test('should have correct oauth url', async () => {
        global.fetch = jest.fn(async (url /* , init */) => {
            expect(url).toBe('https://oauth.reddit.com/endpoint?raw_json=1');
            return {
                json: jest.fn(async () => response),
            };
        });
        const result = await reddit.GET(endpoint);
        expect(result).toEqual(response);
    });

    test('should have correct no-oauth url', async () => {
        auth.getAccessToken = jest.fn(async () => null);
        global.fetch = jest.fn(async (url /* , init */) => {
            expect(url).toBe('https://reddit.com/endpoint.json?raw_json=1');
            return {
                json: jest.fn(async () => response),
            };
        });
        const result = await reddit.GET(endpoint);
        expect(result).toEqual(response);
    });
});

describe('API', () => {
    const response = { data: 'data' };
    let GET;

    beforeAll(() => {
        GET = jest.spyOn(reddit, 'GET').mockImplementation(async () => response);
    });

    afterAll(() => {
        GET.mockRestore();
    });
    test('should request api: r/subreddit/new ', async () => {
        const result = await reddit.getSubreddit('test').new();
        expect(GET).toBeCalledWith('/r/test/new', undefined);
        expect(result).toEqual(response);
    });

    test('should request api "r/subreddit/new" with parameters', async () => {
        const listing = { limit: 100 };
        const result = await reddit.getSubreddit('test').new(listing);
        expect(GET).toBeCalledWith('/r/test/new', listing);
        expect(result).toEqual(response);
    });

    test('should request api "r/subreddit/search', async () => {
        const listing = { limit: 10, q: 'query' };
        const result = await reddit.getSubreddit('test').search(listing);
        expect(GET).toBeCalledWith('/r/test/search', { sort: 'new', ...listing });
        expect(result).toEqual(response);
    });

    test('should request api "/search"', async () => {
        const listing = { limit: 10, q: 'query' };
        const result = await reddit.search(listing);
        expect(GET).toBeCalledWith('/search', { sort: 'new', ...listing });
        expect(result).toEqual(response);
    });

    test('should request api "/message/unread"', async () => {
        const listing = { limit: 25 };
        const result = await reddit.messages.unread(listing);
        expect(GET).toBeCalledWith('/message/unread', { ...listing });
        expect(result).toEqual(response);
    });
});
