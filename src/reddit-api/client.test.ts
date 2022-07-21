import { config } from '../constants';
import RedditApiClient from './client';
import auth from './auth';
import fetchMock from 'jest-fetch-mock';

jest.mock('./auth.ts');
afterEach(() => jest.clearAllMocks());

const jsonResponse = (result: unknown, status = 200) => {
    const response = { status, json: () => new Promise((resolve) => resolve(result)) } as unknown as Response;
    return new Promise<Response>((resolve) => resolve(response));
};

describe('HTTP GET request', () => {
    const response = { data: 'data' };
    const endpoint = '/endpoint';
    const accessToken = 'accessToken';
    const params = { p1: 'v1', p2: 'v2' };
    beforeAll(() => {
        auth.getAccessToken = jest.fn(async () => accessToken);
    });

    test('should set accessToken', () => {
        const reddit = new RedditApiClient();
        expect(reddit.accessToken).toBeUndefined();
        reddit.setAccessToken(accessToken);
        expect(reddit.accessToken).toBe(accessToken);
    });

    test('should return JSON response', async () => {
        fetchMock.mockImplementationOnce((url, init) => {
            expect(init).not.toBeUndefined();
            expect(init?.method).toBe('GET');
            expect(init?.headers?.['User-Agent']).toBe(config.userAgent);
            expect(init?.headers?.['Authorization']).toBe(`bearer ${accessToken}`);
            expect(url).toBe('https://oauth.reddit.com/endpoint?p1=v1&p2=v2&raw_json=1');
            return jsonResponse(response);
        });
        const reddit = new RedditApiClient();
        reddit.setAccessToken(accessToken);
        const result = await reddit.GET(endpoint, params);
        expect(result).toEqual(response);
    });

    test('should have correct oauth url without params', async () => {
        fetchMock.mockImplementationOnce((url) => {
            expect(url).toBe('https://oauth.reddit.com/endpoint?raw_json=1');
            return jsonResponse(response);
        });
        const reddit = new RedditApiClient();
        reddit.setAccessToken(accessToken);
        const result = await reddit.GET(endpoint);
        expect(result).toEqual(response);
    });

    test('should have correct public api url', async () => {
        fetchMock.mockImplementationOnce((url) => {
            expect(url).toBe('https://reddit.com/endpoint.json?raw_json=1');
            return jsonResponse(response);
        });
        const reddit = new RedditApiClient();
        const result = await reddit.GET(endpoint);
        expect(result).toEqual(response);
    });

    test('should have correct public api url with params', async () => {
        fetchMock.mockImplementationOnce((url) => {
            expect(url).toBe('https://reddit.com/endpoint.json?p1=v1&p2=v2&raw_json=1');
            return jsonResponse(response);
        });
        const reddit = new RedditApiClient();
        const result = await reddit.GET(endpoint, params);
        expect(result).toEqual(response);
    });
});

describe('API', () => {
    const response = { data: 'data' };
    let GET: ReturnType<typeof jest.spyOn>;
    let reddit: RedditApiClient;

    beforeAll(() => {
        reddit = new RedditApiClient();
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
