// https://www.reddit.com/dev/api/
import { mapObjToQueryStr } from '../utils/index';
import { config } from '../constants';
import type {
    RedditAccount,
    RedditCommentResponse,
    RedditError,
    RedditMessageListing,
    RedditMessageResponse,
    RedditPostResponse,
    RedditSearchListing,
    RedditSubredditListing,
    RedditUserListing,
    RedditUserOverviewResponse,
} from './reddit-types';

type R<T> = Promise<T | RedditError>;

export default class RedditApiClient {
    authOrigin: string;
    publicOrigin: string;
    headers: HeadersInit;
    accessToken?: string | null;

    constructor() {
        this.authOrigin = 'https://oauth.reddit.com';
        this.publicOrigin = 'https://reddit.com';
        this.headers = { Accept: 'application/json' };
    }

    setAccessToken(accessToken?: string | null) {
        this.accessToken = accessToken;
    }

    async GET(endpoint: string, queryParams: Record<string, unknown> = {}) {
        const query = mapObjToQueryStr({ ...queryParams, raw_json: '1' });
        const init: RequestInit = { method: 'GET', headers: { ...this.headers } };
        if (this.accessToken) {
            init.headers['User-Agent'] = config.userAgent;
            init.headers['Authorization'] = `bearer ${this.accessToken}`;
        }
        const origin = this.accessToken ? this.authOrigin : this.publicOrigin;
        const actualEndpoint = this.accessToken ? endpoint : `${endpoint}.json`;
        const result = await fetch(encodeURI(`${origin}${actualEndpoint}?${query}`), init);
        return result.json();
    }

    getSubreddit(subreddit: string) {
        return {
            new: async (listing?: RedditSubredditListing) =>
                this.GET(`/r/${subreddit}/new`, listing) as R<RedditPostResponse>,
            search: async (listing: RedditSearchListing) => this.search(listing, subreddit),
        };
    }

    user(username: string) {
        return {
            overview: async (listing?: RedditUserListing) =>
                this.GET(`/user/${username}/overview`, listing) as R<RedditUserOverviewResponse>,
            comments: async (listing?: RedditUserListing) =>
                this.GET(`/user/${username}/comments`, listing) as R<RedditCommentResponse>,
            submitted: async (listing?: RedditUserListing) =>
                this.GET(`/user/${username}/submitted`, listing) as R<RedditPostResponse>,
        };
    }

    search(listing: RedditSearchListing, subreddit: string | null = null) {
        const listingSortByNew: RedditSearchListing = { sort: 'new', ...listing };
        if (subreddit) return this.GET(`/r/${subreddit}/search`, listingSortByNew) as R<RedditPostResponse>;

        return this.GET('/search', listingSortByNew) as R<RedditPostResponse>;
    }

    get messages() {
        return {
            unread: async (listing?: RedditMessageListing) =>
                this.GET('/message/unread', listing) as R<RedditMessageResponse>,
            inbox: async (listing?: RedditMessageListing) =>
                this.GET('/message/inbox', listing) as R<RedditMessageResponse>,
        };
    }

    me() {
        return this.GET('/api/me') as R<RedditAccount>;
    }
}
