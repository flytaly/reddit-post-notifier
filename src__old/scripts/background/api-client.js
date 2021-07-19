// https://www.reddit.com/dev/api/

import { userAgent } from '../config';
import auth from './auth';
import { mapObjToQueryStr } from '../utils';

export default class RedditApiClient {
    constructor() {
        this.authOrigin = 'https://oauth.reddit.com';
        this.publicOrigin = 'https://reddit.com';
        this.headers = {
            Accept: 'application/json',
        };
    }

    async GET(endpoint, params = {}) {
        const token = await auth.getAccessToken();
        const query = mapObjToQueryStr({ ...params, raw_json: 1 });
        const init = {
            method: 'GET',
            headers: { ...this.headers },
        };
        if (token) {
            init.headers['User-Agent'] = userAgent;
            init.headers.Authorization = `bearer ${token}`;
        }
        const origin = token ? this.authOrigin : this.publicOrigin;
        const actualEndpoint = token ? endpoint : `${endpoint}.json`;
        const result = await fetch(encodeURI(`${origin}${actualEndpoint}?${query}`), init);
        return result.json();
    }

    getSubreddit(subreddit) {
        return {
            /** @param {Object} listing */
            new: async (listing) => this.GET(`/r/${subreddit}/new`, listing),
            search: async (listing) => this.search(listing, subreddit),
        };
    }

    search(listing, subreddit = null) {
        const listingSortByNew = { sort: 'new', ...listing };
        if (subreddit) return this.GET(`/r/${subreddit}/search`, listingSortByNew);

        return this.GET('/search', listingSortByNew);
    }

    get messages() {
        return {
            unread: async (listing) => this.GET('/message/unread', listing),
        };
    }
}
