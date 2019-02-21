import { userAgent } from '../config';
import auth from './auth';
import { mapObjToQueryStr } from '../utils';

export default class RedditApiClient {
    constructor() {
        this.origin = 'https://oauth.reddit.com';
        this.headers = {
            Accept: 'application/json',
            'User-Agent': userAgent,
        };
    }

    async GET(endpoint, params = {}) {
        const token = await auth.getAccessToken();
        const query = mapObjToQueryStr({ ...params, raw_json: 1 });
        const init = {
            method: 'GET',
            headers: {
                ...this.headers,
                Authorization: `bearer ${token}`,
            },
        };
        const result = await fetch(`${this.origin}${endpoint}?${query}`, init);
        return result.json();
    }

    getSubreddit(subreddit) {
        return {
            new: async listing => this.GET(`/r/${subreddit}/new`, listing),
        };
    }
}
