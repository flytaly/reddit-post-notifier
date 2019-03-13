/* eslint-disable no-await-in-loop */
import RedditApiClient from './api-client';
import storage from '../storage';
import { wait } from '../utils';
import popupPort from './popupPort';
import types from '../types';

const reddit = new RedditApiClient();

export const filterNewItems = (timestamp, items) => {
    const newPosts = [];
    for (const item of items) {
        if (item.data.created > timestamp) {
            newPosts.push(item);
        } else {
            return newPosts;
        }
    }

    return newPosts;
};

const app = {
    extractNewItems: (response, info) => {
        const items = response.data.children;
        const newItems = info.lastPostCreated ? filterNewItems(info.lastPostCreated, items) : items;

        if (newItems.length !== 0) {
            return newItems;
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

        const newPosts = app.extractNewItems(response, info);
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
            return;
        }

        const newPosts = app.extractNewItems(response, data);

        if (newPosts) {
            await storage.saveQueryData(query.id, { posts: newPosts });
            popupPort.postMessage({
                type: types.NEW_POSTS,
                payload: { query, posts: newPosts },
            });
        }
    },

    updateUnreadMsg: async (msgData) => {
        const response = await reddit.messages.unread();

        if (!response.data || response.kind !== 'Listing') {
            console.error('Error during fetching unread messages', response);
            return;
        }

        const count = response.data.children ? response.data.children.length : 0;
        const newMessages = app.extractNewItems(response, msgData);

        await storage.saveMessageData({ newMessages, count });
    },

    update: async () => {
        /*
            Sadly currently it's impossible to reliably fetch new posts by 'fullname':
            https://www.reddit.com/dev/api/#fullnames
            Because query with `before=fullname` of a deleted post will return an empty array.
            Hence updates inevitably stop after a while.
            Instead, we ask some last posts and then save only new posts depending on their timestamp
            */
        const {
            watchSubreddits = [], waitTimeout, messages, limit = 10,
        } = await storage.getOptions();
        const watchQueries = await storage.getQueriesList();
        const subData = await storage.getSubredditData();
        const queryData = await storage.getQueriesData();
        const messageData = await storage.getMessageData();

        if (messages) {
            await app.updateUnreadMsg(messageData);
            await wait(waitTimeout * 1000);
        }

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
