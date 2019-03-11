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
    extractNewPosts: (response, info) => {
        const posts = response.data.children;
        const newPosts = info.lastPostCreated ? filterNewPosts(info.lastPostCreated, posts) : posts;

        if (newPosts.length !== 0) {
            return newPosts;
        }
        return null;
    },

    updateSubreddit: async ({ subreddit, subData, listing }) => {
        const info = subData[subreddit] || {};

        // fetch subreddits with error at a slower pace
        if (info.error && (Date.now() - info.lastUpdate < 1000 * 60 * 10)) return;

        // if (info.lastPost) listing.before = info.lastPost;
        const response = await reddit.getSubreddit(subreddit).new(listing);
        if (!response.data || response.kind !== 'Listing') {
            console.error(`Error during fetching new posts from r/${subreddit}: `, response);
            await storage.saveSubredditData(subreddit, { error: response });
            return;
        }

        const newPosts = app.extractNewPosts(response, info);
        if (newPosts) {
            await storage.saveSubredditData(subreddit, { posts: newPosts });
            popupPort.postMessage({
                type: types.NEW_POSTS,
                payload: { subreddit, posts: newPosts },
            });
        }
    },

    updateQueries: async ({ query, queryData, listing }) => {
        const { id, subreddit, query: q } = query;
        if (!q || !id) return;

        const data = queryData[id] || {};

        if (data.error && (Date.now() - data.lastUpdate < 1000 * 60 * 10)) return;
        const response = subreddit
            ? await reddit
                .getSubreddit(subreddit)
                .search({ ...listing, q, restrict_sr: 'on' })
            : await reddit
                .search({ ...listing, q });

        if (!response.data || response.kind !== 'Listing') {
            console.error(`Error during fetching posts query r/${query.query}: `, response);
            await storage.saveQueryData(query.id, { error: response });
        }

        const newPosts = app.extractNewPosts(response, data);

        if (newPosts) {
            await storage.saveQueryData(query.id, { posts: newPosts });
            popupPort.postMessage({
                type: types.NEW_POSTS,
                payload: { query, posts: newPosts },
            });
        }
    },

    update: async () => {
        /*
            Sadly currently it's impossible to reliably fetch new posts by 'fullname':
            https://www.reddit.com/dev/api/#fullnames
            Because query with `before=fullname` of a deleted post will return an empty array.
            Hence updates inevitably stop after a while.
            Instead, we ask some last posts and then save only new posts depending on their timestamp
            */
        const { watchSubreddits = [], waitTimeout, limit = 10 } = await storage.getOptions();
        const watchQueries = await storage.getQueriesList();
        const subData = await storage.getSubredditData();
        const queryData = await storage.getQueriesData();


        for (const subreddit of watchSubreddits) {
            await app.updateSubreddit({ subreddit, subData, listing: { limit } });
            await wait(waitTimeout * 1000);
        }

        for (const query of watchQueries) {
            await app.updateQueries({ query, queryData, listing: { limit } });
            await wait(waitTimeout * 1000);
        }
    },

};

export default app;
