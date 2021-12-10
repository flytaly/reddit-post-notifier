/* eslint-disable no-await-in-loop */
import RedditApiClient from '../reddit-api/client';
import type {
    RedditError,
    RedditListingResponse,
    RedditPostExtended,
    RedditSearchListing,
    RedditSubredditListing,
    RedditUserOverviewResponse,
} from '../reddit-api/reddit-types';
import { RedditObjectKind } from '../reddit-api/reddit-types';
import storage from '../storage';
import type {
    FollowingUser,
    MessageData,
    QueryData,
    QueryOpts,
    SubredditData,
    SubredditOpts,
} from '../storage/storage-types';
import { postFilter } from '../text-search/post-filter';
import type { ExtensionOptions } from '../types/extension-options';
import { filterPostDataProperties, getSearchQueryUrl, getSubredditUrl, getUserProfileUrl } from '../utils/index';
import { wait } from '../utils/wait';
import type { NewPostsNotification } from './notifications';
import notify, { NotificationId } from './notifications';

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
    subData?: SubredditData;
    listing?: Partial<RedditSubredditListing>;
}

interface UpdateQueryProps {
    query: QueryOpts;
    queryData?: QueryData;
    listing?: Partial<RedditSearchListing>;
}

function isErrorResponse(result: RedditError | RedditListingResponse<unknown>): result is RedditError {
    return result['data'] === undefined;
}

export async function updateFollowingUser(user: FollowingUser): Promise<{ user: FollowingUser; newItemsLen?: number }> {
    user = { ...user };
    const fetchUser = reddit.user(user.username);
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

    if (isErrorResponse(response)) {
        console.error(`Error during fetching ${user.username}'s activities`, response);
        user.error = response;
        return { user };
    }
    if (!response.data?.children?.length) return { user };

    const newItems = extractNewItems(response, user);
    if (!newItems) return { user };
    const itemsToSave = newItems.map((p) => (p.kind === RedditObjectKind.link ? filterPostDataProperties(p) : p));

    user.data = [...itemsToSave, ...(user.data || [])].slice(0, 50);
    user.error = null;
    user.lastPostCreated = itemsToSave[0].data.created;
    user.lastUpdate = Date.now();
    return { user, newItemsLen: itemsToSave.length };
}

const app = {
    updateSubreddit: async ({ subOpts, subData = {}, listing }: UpdateSubredditProps) => {
        const { subreddit, id, filterOpts } = subOpts;
        const info = subData;

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

    updateQuery: async ({ query, queryData, listing = {} }: UpdateQueryProps) => {
        const { id, subreddit, query: q } = query;
        if (!q || !id) return null;

        const data = queryData || {};

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

    updateUsersList: async (usersList: FollowingUser[], options: ExtensionOptions, ignorePollInterval = false) => {
        const pollInterval = ignorePollInterval ? 0 : options.pollUserInterval * 1000;
        const notifyBatch: NewPostsNotification[] = [];
        let updated = 0;
        for (let i = 0; i < usersList.length; i++) {
            const ts = Date.now();

            if (ts - (usersList[i].lastUpdate || 0) < pollInterval) {
                continue;
            }

            const { user, newItemsLen } = await updateFollowingUser(usersList[i]);

            usersList[i] = user;

            if (user.notify && newItemsLen) {
                const link = getUserProfileUrl(user.username, user.watch, options.useOldReddit);
                notifyBatch.push({ len: newItemsLen, link, name: user.username });
            }

            user.lastUpdate = ts;
            updated += 1;
            if (i < usersList.length - 1) await wait(1000);
        }
        await storage.saveUsersList(usersList);

        if (notifyBatch.length) notify(NotificationId.user, notifyBatch, options.notificationSoundId);

        return updated;
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
    update: async (isForcedByUser = false) => {
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
            const updated = await app.updateUsersList(usersList, options, isForcedByUser);
            if (updated) await wait(waitTimeout * 1000);
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

            const newPosts = await app.updateSubreddit({
                subOpts,
                subData: subData[subOpts.id],
                listing: { limit: actualLimit },
            });
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

            const newMessages = await app.updateQuery({ query, queryData: queryData[query.id], listing: { limit } });
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
