/* eslint-disable no-await-in-loop */
import RedditApiClient from './api-client';
import storage from '../storage';
import { wait, getSubredditUrl, getSearchQueryUrl } from '../utils';
import notify, { notificationIds } from './notifications';

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
        if (info.error && Date.now() - info.lastUpdate < 1000 * 60 * 10) return null;

        // if (info.lastPost) listing.before = info.lastPost;
        const response = await reddit.getSubreddit(subreddit).new(listing);
        if (!response.data || response.kind !== 'Listing') {
            console.error(`Error during fetching new posts from r/${subreddit}: `, response);
            await storage.saveSubredditData(subreddit, { error: response });
            return null;
        }

        const newPosts = app.extractNewItems(response, info);
        if (newPosts) {
            await storage.saveSubredditData(subreddit, { posts: newPosts });
        }
        return newPosts;
    },

    updateQueries: async ({ query, queryData, listing }) => {
        const { id, subreddit, query: q } = query;
        if (!q || !id) return null;

        const data = queryData[id] || {};

        if (data.error && Date.now() - data.lastUpdate < 1000 * 60 * 10) return null;
        const response = subreddit
            ? await reddit.getSubreddit(subreddit).search({ ...listing, q, restrict_sr: 'on' })
            : await reddit.search({ ...listing, q });

        if (!response.data || response.kind !== 'Listing') {
            console.error(
                `Error during fetching posts query ${query.query} on ${query.subreddit || 'reddit'}: `,
                response,
            );
            await storage.saveQueryData(query.id, { error: response });
            return null;
        }

        const newPosts = app.extractNewItems(response, data);

        if (newPosts) {
            await storage.saveQueryData(query.id, { posts: newPosts });
        }
        return newPosts;
    },

    updateUnreadMsg: async (msgData) => {
        const response = await reddit.messages.unread();

        if (!response.data || response.kind !== 'Listing') {
            console.error('Error during fetching unread messages', response);
            return null;
        }

        const count = response.data.children ? response.data.children.length : 0;
        const newMessages = app.extractNewItems(response, msgData);

        await storage.saveMessageData({ newMessages, count });
        return newMessages;
    },

    update: async () => {
        /*
            Sadly currently it's impossible to reliably fetch new posts by 'fullname':
            https://www.reddit.com/dev/api/#fullnames
            Because query with `before=fullname` of a deleted post will return an empty array.
            Hence updates inevitably stop after a while.
            Instead, we ask some last posts and then save only new posts depending on their timestamp
            */
        const { waitTimeout, messages, limit = 10, messageNotify, subredditNotify } = await storage.getOptions();
        const {
            queries: queryData,
            queriesList,
            subredditList,
            subreddits: subData,
            messages: messageData,
        } = await storage.getAllData();
        const authData = await storage.getAuthData();

        if (messages && authData && authData.refreshToken) {
            const newMessages = await app.updateUnreadMsg(messageData);
            if (messageNotify && newMessages && newMessages.length) notify(notificationIds.mail, newMessages);
            await wait(waitTimeout * 1000);
        }

        const notificationBatch = [];
        for (const subreddit of subredditList) {
            const newMessages = await app.updateSubreddit({ subreddit, subData, listing: { limit } });
            if (subredditNotify && newMessages && newMessages.length) {
                notificationBatch.push({
                    subreddit,
                    len: newMessages.length,
                    link: getSubredditUrl(subreddit),
                });
            }
            await wait(waitTimeout * 1000);
        }
        notify(notificationIds.subreddit, notificationBatch);

        notificationBatch.length = 0;
        for (const query of queriesList) {
            const newMessages = await app.updateQueries({ query, queryData, listing: { limit } });

            if (query.notify && newMessages && newMessages.length) {
                notificationBatch.push({
                    query: query.name || query.query,
                    len: newMessages.length,
                    link: getSearchQueryUrl(query.query, query.subreddit),
                });
            }
            await wait(waitTimeout * 1000);
        }
        notify(notificationIds.query, notificationBatch);
    },
};

export default app;
