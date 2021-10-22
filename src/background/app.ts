/* eslint-disable no-await-in-loop */
import RedditApiClient from '../reddit-api/client';
import type {
    RedditError,
    RedditListingResponse,
    RedditPostExtended,
    RedditSearchListing,
    RedditSubredditListing,
} from '../reddit-api/reddit-types';
import storage from '../storage';
import type { MessageData, QueryOpts, StorageFields, SubredditOpts } from '../storage/storage-types';
import { getSearchQueryUrl, getSubredditUrl } from '../utils/index';
import { wait } from '../utils/wait';
import notify, { NewPostsNotification, NotificationId } from './notifications';

const reddit = new RedditApiClient();

interface ItemWithDate {
    data: { created: number };
}

export function filterNewItems<T extends ItemWithDate>(timestamp: number, items: T[]) {
    const newPosts: T[] = [];
    for (const item of items) {
        if (item.data.created > timestamp) {
            newPosts.push(item);
        } else {
            return newPosts;
        }
    }

    return newPosts;
}

function extractNewItems<T extends ItemWithDate>(
    response: RedditListingResponse<T>,
    info: { lastPostCreated?: number },
): T[] | null {
    const items = response.data.children;
    const newItems = info.lastPostCreated ? filterNewItems(info.lastPostCreated, items) : items;

    if (newItems.length !== 0) {
        return newItems;
    }
    return null;
}

interface UpdateSubredditProps {
    subOpts: SubredditOpts;
    subData: StorageFields['subreddits'];
    listing: Partial<RedditSubredditListing>;
}

interface UpdateQueryProps {
    query: QueryOpts;
    queryData: StorageFields['queries'];
    listing: Partial<RedditSearchListing>;
}

function isErrorResponse(result: RedditError | RedditListingResponse<unknown>): result is RedditError {
    return result['data'] === undefined;
}

const app = {
    updateSubreddit: async ({ subOpts, subData, listing }: UpdateSubredditProps) => {
        const { subreddit, id } = subOpts;
        const info = subData[id] || {};

        // fetch subreddits with error at a slower pace
        if (info.error && Date.now() - info.lastUpdate < 1000 * 60 * 6) return null;

        const response = await reddit.getSubreddit(subreddit).new(listing);
        if (isErrorResponse(response)) {
            console.error(`Error during fetching new posts from r/${subreddit}: `, response);
            await storage.saveSubredditData(id, { error: response });
            return null;
        }

        const newPosts = extractNewItems(response, info) || [];
        await storage.saveSubredditData(id, { posts: newPosts });
        return newPosts;
    },

    updateQueries: async ({ query, queryData, listing }: UpdateQueryProps) => {
        const { id, subreddit, query: q } = query;
        if (!q || !id) return null;

        const data = queryData[id] || {};

        if (data.error && Date.now() - data.lastUpdate < 1000 * 60 * 10) return null;
        const response = subreddit
            ? await reddit.getSubreddit(subreddit).search({ ...listing, q, restrict_sr: 'on' })
            : await reddit.search({ ...listing, q });

        if (isErrorResponse(response)) {
            console.error(
                `Error during fetching posts query ${query.query} on ${query.subreddit || 'reddit'}: `,
                response,
            );
            await storage.saveQueryData(query.id, { error: response });
            return null;
        }

        const newPosts: RedditPostExtended[] = extractNewItems(response, data) || [];
        await storage.saveQueryData(query.id, { posts: newPosts, error: null });
        return newPosts;
    },

    updateUnreadMsg: async (msgData: MessageData) => {
        const response = await reddit.messages.unread();

        if (isErrorResponse(response)) {
            console.error('Error during fetching unread messages', response);
            return null;
        }

        const count = response.data.children ? response.data.children.length : 0;
        const newMessages = extractNewItems(response, msgData);

        await storage.saveMessageData({ newMessages, count });
        return newMessages;
    },

    /**
     * Update extension data and save into storage
     *
     * Sadly, currently it's impossible to reliably fetch new posts by 'fullname':
     * https://www.reddit.com/dev/api/#fullnames
     * Because query with `before=fullname` of a deleted post will return an empty array.
     * Hence updates inevitably stop after a while. Instead, we ask some last posts
     * and then save only new posts depending on their timestamp
     * */
    update: async () => {
        const {
            queries: queryData,
            queriesList,
            subredditList,
            subreddits: subData,
            messages: messageData,
            options,
            refreshToken,
        } = await storage.getAllData();

        const { waitTimeout, messages, limit = 10, messagesNotify, notificationSoundId, useOldReddit } = options;

        if (messages && refreshToken) {
            const newMessages = await app.updateUnreadMsg(messageData);
            if (messagesNotify && newMessages?.length) {
                notify(NotificationId.mail, newMessages, notificationSoundId);
            }
            await wait(waitTimeout * 1000);
        }

        let batch: NewPostsNotification[] = [];
        for (const subOpts of subredditList) {
            const newPosts = await app.updateSubreddit({ subOpts, subData, listing: { limit } });
            if (subOpts.notify && newPosts?.length) {
                const link = getSubredditUrl(subOpts.subreddit, useOldReddit);
                batch.push({ name: subOpts.subreddit, len: newPosts.length, link });
            }
            await wait(waitTimeout * 1000);
        }
        if (batch.length) notify(NotificationId.post, batch, notificationSoundId);

        batch = [];
        for (const query of queriesList) {
            const newMessages = await app.updateQueries({ query, queryData, listing: { limit } });
            if (query.notify && newMessages?.length) {
                batch.push({
                    name: query.name || query.query,
                    len: newMessages.length,
                    link: getSearchQueryUrl(query.query, query.subreddit, useOldReddit),
                });
            }
            await wait(waitTimeout * 1000);
        }
        if (batch.length) notify(NotificationId.post, batch, notificationSoundId);
    },
};
// };

export default app;
