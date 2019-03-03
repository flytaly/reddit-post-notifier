/* eslint-disable no-await-in-loop */
import RedditApiClient from './api-client';
import storage from '../storage';
import { wait } from '../utils';

const reddit = new RedditApiClient();

const app = {
    update: async () => {
        const { watchSubreddits, updateInterval } = await storage.getOptions();
        const subData = await storage.getSubredditData();
        for (const subreddit of watchSubreddits) {
            const info = subData[subreddit] || {};

            // eslint-disable-next-line no-continue
            if (info.error && (Date.now() - info.lastUpdate < 1000 * 60 * 10)) continue;

            const listing = {};
            if (info.lastPost) listing.before = info.lastPost;
            const response = await reddit.getSubreddit(subreddit).new(listing);
            if (response.data && response.kind === 'Listing') {
                await storage.saveSubredditData(subreddit, { posts: response.data.children });
            } else {
                console.error(`Error during fetching new posts from r/${subreddit}: `, response);
                await storage.saveSubredditData(subreddit, { error: response });
            }

            await wait(updateInterval * 1000);
        }
    },

};

export default app;
