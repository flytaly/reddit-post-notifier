/* eslint-disable no-await-in-loop */
import RedditApiClient, { UserActivityResponse } from '../reddit-api/client';
import {
    RedditError,
    RedditListingResponse,
    RedditObjectKind,
    RedditPostExtended,
    RedditSearchListing,
    RedditSubredditListing,
    RedditUserOverviewResponse,
} from '../reddit-api/reddit-types';
import storage from '../storage';
import type { FollowingUser, MessageData, QueryOpts, StorageFields, SubredditOpts } from '../storage/storage-types';
import { postFilter } from '../text-search/post-filter';
import { filterPostDataProperties, getSearchQueryUrl, getSubredditUrl } from '../utils/index';
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
        const { subreddit, id, filterOpts } = subOpts;
        const info = subData[id] || {};

        // fetch subreddits with error at a slower pace
        if (info.error && Date.now() - info.lastUpdate < 1000 * 60 * 6) return null;

        const response = await reddit.getSubreddit(subreddit).new(listing);
        if (isErrorResponse(response)) {
            console.error(`Error during fetching new posts from r/${subreddit}: `, response);
            await storage.saveSubredditData(id, { error: response });
            return null;
        }

        let newPosts = extractNewItems(response, info) || [];
        let lastPostCreated: number | null = null;
        if (newPosts.length && filterOpts?.enabled && filterOpts?.rules?.length) {
            lastPostCreated = newPosts[0].data?.created;
            newPosts = postFilter(newPosts, filterOpts.rules, filterOpts.fields);
        }
        await storage.saveSubredditData(id, { posts: newPosts, lastPostCreated });
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

    updateUserObject(response: UserActivityResponse, user: FollowingUser): NewPostsNotification | undefined {
        if (isErrorResponse(response)) {
            console.error(`Error during fetching ${user.username}'s activities`, response);
            user.error = response;
            return;
        }
        if (!response.data?.children?.length) return;

        const newItems = extractNewItems(response, user);
        if (!newItems) return;
        const itemsToSave = newItems.map((p) => {
            if (p.kind === RedditObjectKind.link) return filterPostDataProperties(p);

            return p;
        });

        user.data = [...itemsToSave, ...(user.data || [])];
        user.error = null;
        user.lastPostCreated = itemsToSave[0].data.created;
        if (user.notify) return { len: newItems.length, link: '', name: user.username };
    },

    updateUsersList: async (usersList: FollowingUser[]) => {
        const notifyBatch: NewPostsNotification[] = [];
        for (let i = 0; i < usersList.length; i++) {
            const user = usersList[i];
            const username = user.username;

            const fetchUser = reddit.user(username);
            let response: RedditError | RedditUserOverviewResponse;
            switch (user.watch) {
                case 'comments':
                    response = await fetchUser.comments();
                    break;
                case 'submitted':
                    response = await fetchUser.submitted();
                    break;
                default:
                    response = await fetchUser.overview();
            }
            const notify = app.updateUserObject(response, user);
            if (notify) notifyBatch.push(notify);
            user.lastUpdate = Date.now();
            if (i < usersList.length - 1) await wait(1000);
        }
        await storage.saveUsersList(usersList);

        if (notifyBatch.length) {
            // TODO: notify
        }
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
            usersList,
        } = await storage.getAllData();

        const { waitTimeout, messages, limit = 10, messagesNotify, notificationSoundId, useOldReddit } = options;

        if (usersList) {
            await app.updateUsersList(usersList);
            await wait(waitTimeout * 1000);
        }

        if (messages && refreshToken) {
            const newMessages = await app.updateUnreadMsg(messageData);
            if (messagesNotify && newMessages?.length) {
                notify(NotificationId.mail, newMessages, notificationSoundId);
            }
            await wait(waitTimeout * 1000);
        }

        let batch: NewPostsNotification[] = [];
        for (const subOpts of subredditList) {
            if (subOpts.disabled) continue;

            // increase limit if it's the first update with filters
            const actualLimit =
                subOpts.filterOpts?.enabled && !subData[subOpts.id]?.lastPostCreated ? Math.max(limit, 25) : limit;

            const newPosts = await app.updateSubreddit({ subOpts, subData, listing: { limit: actualLimit } });
            if (subOpts.notify && newPosts?.length) {
                const link = getSubredditUrl(subOpts.subreddit, useOldReddit);
                batch.push({ name: subOpts.subreddit, len: newPosts.length, link });
            }
            await wait(waitTimeout * 1000);
        }
        if (batch.length) notify(NotificationId.post, batch, notificationSoundId);

        batch = [];
        for (const query of queriesList) {
            if (query.disabled) continue;

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
