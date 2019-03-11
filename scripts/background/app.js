/* eslint-disable no-await-in-loop */
import RedditApiClient from './api-client';
import storage from '../storage';
import { wait } from '../utils';
import popupPort from './popupPort';
import types from '../types';

const reddit = new RedditApiClient();

export const filterNewPosts = (timestamp, posts) => {
    const newPosts = [];
    for (const post of posts) {
        if (post.data.created > timestamp) {
            newPosts.push(post);
        } else {
            return newPosts;
        }
    }
    return newPosts;
};

const app = {
    update: async () => {
        const { watchSubreddits = [], waitTimeout } = await storage.getOptions();
        const subData = await storage.getSubredditData();
        for (const subreddit of watchSubreddits) {
            /*
            Sadly currently it's impossible to reliably fetch new posts by 'fullname':
            https://www.reddit.com/dev/api/#fullnames
            Because query with `before=fullname` of a deleted post will return an empty array.
            Hence updates inevitably stop after a while.
            Instead, we ask some last posts and then save only new posts depending on their timestamp
            */
            const info = subData[subreddit] || {};

            // fetch subreddits with error at a slower pace
            if (info.error && (Date.now() - info.lastUpdate < 1000 * 60 * 10)) continue; // eslint-disable-line no-continue

            const listing = {
                limit: 10,
            };
            // if (info.lastPost) listing.before = info.lastPost;
            const response = await reddit.getSubreddit(subreddit).new(listing);
            if (response.data && response.kind === 'Listing') {
                const posts = response.data.children;
                const newPosts = info.lastPostCreated ? filterNewPosts(info.lastPostCreated, posts) : posts;
                if (newPosts.length !== 0) {
                    await storage.saveSubredditData(subreddit, { posts: newPosts });
                    popupPort.postMessage({
                        type: types.NEW_POSTS,
                        payload: { subreddit, posts: newPosts },
                    });
                }
            } else {
                console.error(`Error during fetching new posts from r/${subreddit}: `, response);
                await storage.saveSubredditData(subreddit, { error: response });
            }

            await wait(waitTimeout * 1000);
        }
    },

};

export default app;
