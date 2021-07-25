// https://www.reddit.com/dev/api/
import auth from './auth';
import { mapObjToQueryStr } from '../utils/index';
import { config } from '../constants';
import type {
    RedditError,
    RedditMessageListing,
    RedditMessageResponse,
    RedditPostResponse,
    RedditSearchListing,
    RedditSubredditListing,
} from './reddit-types';

export default class RedditApiClient {
    authOrigin: string;
    publicOrigin: string;
    headers: HeadersInit;

    constructor() {
        this.authOrigin = 'https://oauth.reddit.com';
        this.publicOrigin = 'https://reddit.com';
        this.headers = { Accept: 'application/json' };
    }

    async GET(endpoint: string, params: Record<string, unknown> = {}) {
        const token = await auth.getAccessToken();
        const query = mapObjToQueryStr({ ...params, raw_json: '1' });
        const init: RequestInit = { method: 'GET', headers: { ...this.headers } };
        if (token) {
            init.headers['User-Agent'] = config.userAgent;
            init.headers['Authorization'] = `bearer ${token}`;
        }
        const origin = token ? this.authOrigin : this.publicOrigin;
        const actualEndpoint = token ? endpoint : `${endpoint}.json`;
        const result = await fetch(encodeURI(`${origin}${actualEndpoint}?${query}`), init);
        return result.json();
    }

    getSubreddit(subreddit: string) {
        return {
            new: async (listing?: RedditSubredditListing) =>
                this.GET(`/r/${subreddit}/new`, listing) as Promise<RedditPostResponse | RedditError>,
            search: async (listing: RedditSearchListing) =>
                this.search(listing, subreddit) as Promise<RedditPostResponse | RedditError>,
        };
    }

    search(listing: RedditSearchListing, subreddit: string | null = null) {
        const listingSortByNew: RedditSearchListing = { sort: 'new', ...listing };
        if (subreddit) return this.GET(`/r/${subreddit}/search`, listingSortByNew);

        return this.GET('/search', listingSortByNew) as Promise<RedditPostResponse | RedditError>;
    }

    get messages() {
        return {
            unread: async (listing?: RedditMessageListing) =>
                this.GET('/message/unread', listing) as Promise<RedditMessageResponse | RedditError>,
        };
    }
}
