// https://www.reddit.com/dev/api/
import { DEV_SERVER, IS_DEV, USE_DEV_SERVER, config } from '@/constants';
import { mapObjToQueryStr } from '../utils/index';
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

type R<T> = Promise<T | RedditError | never>;

const enum RateLimitHeaders {
    'remaining' = 'x-ratelimit-remaining',
    'reset' = 'x-ratelimit-reset',
    'used' = 'x-ratelimit-used',
}

export type RateLimits = {
    remaining?: number | null;
    reset?: number | null;
    used?: number | null;
};

function getRateLimits(response: Response): RateLimits {
    const rateLimits = {
        used: response.headers.get(RateLimitHeaders.used),
        reset: response.headers.get(RateLimitHeaders.reset),
        remaining: response.headers.get(RateLimitHeaders.remaining),
    };

    return {
        used: rateLimits.used ? parseInt(rateLimits.used) : null,
        reset: rateLimits.reset ? parseInt(rateLimits.reset) : null,
        remaining: rateLimits.remaining ? parseInt(rateLimits.remaining) : null,
    };
}

export default class RedditApiClient {
    authOrigin: string;
    publicOrigin: string;
    headers: HeadersInit;
    accessToken?: string | null;
    onRateLimits?: (rl: RateLimits) => void;
    fetchOpts: RequestInit = {
        cache: 'reload',
    };

    constructor(onRateLimits?: (rl: RateLimits) => void) {
        this.authOrigin = 'https://oauth.reddit.com';
        this.publicOrigin = 'https://www.reddit.com';
        this.headers = { Accept: 'application/json' };
        this.onRateLimits = onRateLimits;

        if (IS_DEV && USE_DEV_SERVER) {
            this.authOrigin = DEV_SERVER;
            this.publicOrigin = DEV_SERVER;
        }
    }
    async GET(endpoint: string, queryParams: Record<string, unknown> = {}) {
        const query = mapObjToQueryStr({ ...queryParams, raw_json: '1' });
        const init: RequestInit = { method: 'GET', headers: { ...this.headers }, ...this.fetchOpts };

        if (this.accessToken) {
            if (!init.headers) init.headers = {};
            init.headers['User-Agent'] = config.userAgent;
            init.headers['Authorization'] = `bearer ${this.accessToken}`;
        }
        const origin = this.accessToken ? this.authOrigin : this.publicOrigin;
        const actualEndpoint = this.accessToken ? endpoint : `${endpoint}.json`;
        const result = await fetch(encodeURI(`${origin}${actualEndpoint}?${query}`), init);

        if (this.onRateLimits && !this.accessToken) this.onRateLimits(getRateLimits(result));

        if (result.ok) return result.json();

        try {
            const errorResponse = await result.json();
            return errorResponse as RedditError;
        } catch (error) {
            throw new Error(`status code: ${result.status}. ${result.statusText}`);
        }
    }

    setAccessToken(accessToken?: string | null) {
        this.accessToken = accessToken;
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
