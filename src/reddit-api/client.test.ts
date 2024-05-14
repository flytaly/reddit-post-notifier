import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import RedditApiClient from './client';
import type { RedditError } from './reddit-types';
import { config } from '@/constants';

const fetchMock = vi.spyOn(globalThis, 'fetch');

afterEach(() => {
    vi.clearAllMocks();
});

function jsonResponse(result: unknown, status = 200) {
    const response = {
        status,
        headers: new Headers(),
        json: () => new Promise(resolve => resolve(result)),
    } as unknown as Response;
    return new Promise<Response>(resolve => resolve(response));
}

describe('hTTP GET request', () => {
    const response = { data: 'data' };
    const endpoint = '/endpoint';
    const accessToken = 'accessToken';
    const params = { p1: 'v1', p2: 'v2' };

    it('should set accessToken', () => {
        const reddit = new RedditApiClient();
        expect(reddit.accessToken).toBeUndefined();
        reddit.setAccessToken(accessToken);
        expect(reddit.accessToken).toBe(accessToken);
    });

    it('should return JSON response', async () => {
        fetchMock.mockImplementationOnce((url, init) => {
            expect(init).not.toBeUndefined();
            expect(init?.method).toBe('GET');
            const headers = (init?.headers as Record<string, string | undefined>) || {};
            expect(headers['User-Agent']).toBe(config.userAgent);
            expect(headers.Authorization).toBe(`bearer ${accessToken}`);
            expect(url).toBe('https://oauth.reddit.com/endpoint?p1=v1&p2=v2&raw_json=1');
            return jsonResponse(response);
        });
        const reddit = new RedditApiClient();
        reddit.setAccessToken(accessToken);
        const result = await reddit.GET(endpoint, params);
        expect(result).toEqual(response);
    });

    it('should have correct oauth url without params', async () => {
        fetchMock.mockImplementationOnce((url) => {
            expect(url).toBe('https://oauth.reddit.com/endpoint?raw_json=1');
            return jsonResponse(response);
        });
        const reddit = new RedditApiClient();
        reddit.setAccessToken(accessToken);
        const result = await reddit.GET(endpoint);
        expect(result).toEqual(response);
    });

    it('should have correct public api url', async () => {
        fetchMock.mockImplementationOnce((url) => {
            expect(url).toBe('https://www.reddit.com/endpoint.json?raw_json=1');
            return jsonResponse(response);
        });
        const reddit = new RedditApiClient();
        const result = await reddit.GET(endpoint);
        expect(result).toEqual(response);
    });

    it('should have correct public api url with params', async () => {
        fetchMock.mockImplementationOnce((url) => {
            expect(url).toBe('https://www.reddit.com/endpoint.json?p1=v1&p2=v2&raw_json=1');
            return jsonResponse(response);
        });
        const reddit = new RedditApiClient();
        const result = await reddit.GET(endpoint, params);
        expect(result).toEqual(response);
    });

    it('should return error', async () => {
        const rError: RedditError = {
            error: 404,
            message: 'Not Found',
            reason: 'banned',
        };
        fetchMock.mockImplementation(() => {
            return jsonResponse(rError, 404);
        });
        const reddit = new RedditApiClient();
        const result = await reddit.GET('bannedSub', params);
        expect(result).toEqual(rError);
    });
});

describe('aPI', () => {
    const response = { data: 'data' };
    let reddit: RedditApiClient;

    beforeAll(() => {
        reddit = new RedditApiClient();
        vi.spyOn(reddit, 'GET').mockImplementation(async () => response);
    });

    it('should request api: r/subreddit/new ', async () => {
        const result = await reddit.getSubreddit('test').new();
        expect(reddit.GET).toBeCalledWith('/r/test/new', undefined);
        expect(result).toEqual(response);
    });

    it('should request api "r/subreddit/new" with parameters', async () => {
        const listing = { limit: 100 };
        const result = await reddit.getSubreddit('test').new(listing);
        expect(reddit.GET).toBeCalledWith('/r/test/new', listing);
        expect(result).toEqual(response);
    });

    it('should request api "r/subreddit/search', async () => {
        const listing = { limit: 10, q: 'query' };
        const result = await reddit.getSubreddit('test').search(listing);
        expect(reddit.GET).toBeCalledWith('/r/test/search', { sort: 'new', ...listing });
        expect(result).toEqual(response);
    });

    it('should request api "/search"', async () => {
        const listing = { limit: 10, q: 'query' };
        const result = await reddit.search(listing);
        expect(reddit.GET).toBeCalledWith('/search', { sort: 'new', ...listing });
        expect(result).toEqual(response);
    });

    it('should request api "/message/unread"', async () => {
        const listing = { limit: 25 };
        const result = await reddit.messages.unread(listing);
        expect(reddit.GET).toBeCalledWith('/message/unread', { ...listing });
        expect(result).toEqual(response);
    });
});
