/* eslint-disable no-await-in-loop */
import auth from '@/reddit-api/auth';
import RedditApiClient from '../reddit-api/client';
import type {
    RedditAccount,
    RedditError,
    RedditListingResponse,
    RedditMessage,
    RedditPostExtended,
    RedditPostResponse,
    RedditSearchListing,
    RedditSubredditListing,
    RedditUserOverviewResponse,
} from '../reddit-api/reddit-types';
import { RedditObjectKind } from '../reddit-api/reddit-types';
import scopes from '../reddit-api/scopes';
import type { RedditScope } from '../reddit-api/scopes';
import storage from '../storage';
import type {
    AuthUser,
    FollowingUser,
    QueryData,
    QueryOpts,
    StorageFields,
    SubredditData,
    SubredditOpts,
} from '../storage/storage-types';
import { postFilter } from '../text-search/post-filter';
import type { ExtensionOptions } from '../types/extension-options';
import {
    filterPostDataProperties,
    getAccountByScope,
    getSearchQueryUrl,
    getSubredditUrl,
    getUserProfileUrl,
} from '../utils/index';
import { wait } from '../utils/wait';
import type { MessageNotification, PostNotification, UserNotification } from './notifications';
import notify, { NotificationId } from './notifications';
import { AuthError, isAuthError } from '@/reddit-api/errors';
import redditScopes from '../reddit-api/scopes';

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
    info: { lastPostCreated?: number | null },
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

function isErrorResponse(result: RedditError | RedditListingResponse<unknown> | RedditAccount): result is RedditError {
    return result['data'] === undefined;
}

export default class NotifierApp {
    reddit: RedditApiClient;
    constructor() {
        this.reddit = new RedditApiClient();
    }

    async updateSubreddit({
        subOpts,
        subData = {},
        listing,
    }: UpdateSubredditProps): Promise<RedditPostExtended[] | null> {
        const { subreddit, id, filterOpts } = subOpts;
        const info = subData;

        // fetch subreddits with error at a slower pace
        if (info.error && info.lastUpdate && Date.now() - info.lastUpdate < 1000 * 60 * 6) return null;

        let response: RedditPostResponse | RedditError;
        try {
            response = await reddit.getSubreddit(subreddit).new(listing);
        } catch (error) {
            if (isAuthError(error)) {
                return this.onAuthError(error);
            }
            response = { message: error.message };
        }

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
    }

    async updateQuery({ query, queryData, listing = {} }: UpdateQueryProps) {
        const { id, subreddit, query: q } = query;
        if (!q || !id) return null;

        const data = queryData || {};

        if (data.error && data.lastUpdate && Date.now() - data.lastUpdate < 1000 * 60 * 10) return null;

        let response: RedditError | RedditPostResponse;
        try {
            response = subreddit
                ? await reddit.getSubreddit(subreddit).search({ ...listing, q, restrict_sr: 'on' })
                : await reddit.search({ ...listing, q });
        } catch (error) {
            if (isAuthError(error)) {
                return this.onAuthError(error);
            }
            response = { message: error.message };
        }

        if (isErrorResponse(response)) {
            console.error(
                `Error during fetching posts query ${query.query || ''} on ${query.subreddit || 'reddit'}: `,
                response,
            );
            await storage.saveQueryData(query.id, { error: response });
            return null;
        }

        const newPosts: RedditPostExtended[] = extractNewItems(response, data) || [];
        await storage.saveQueryData(query.id, { posts: newPosts, error: null });
        return newPosts;
    }

    async updateUnreadMsg(account: AuthUser): Promise<null | RedditMessage[]> {
        try {
            const token = await auth.getAccessToken(account);
            if (!token) return null;
            this.reddit.setAccessToken(token);

            const response = await this.reddit.messages.unread();

            if (isErrorResponse(response)) {
                throw new Error(response.message);
            }

            const newMessages = extractNewItems(response, account.mail || {});

            await storage.saveMessageData(account.id, { unreadMessages: newMessages });
            return newMessages;
        } catch (error) {
            if (isAuthError(error)) {
                return this.onAuthError(error);
            }
            const message = error.message || error;
            console.error('Error during fetching unread messages ', message);
            await storage.saveMessageData(account.id, { error: { message } });
            return null;
        }
    }

    async updateFollowingUser(user: FollowingUser): Promise<{ user: FollowingUser; newItemsLen?: number }> {
        user = { ...user };
        const fetchUser = reddit.user(user.username);
        let response: RedditError | RedditUserOverviewResponse;
        try {
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
        } catch (error) {
            if (isAuthError(error)) {
                await this.onAuthError(error);
                return { user };
            }
            response = { message: error.message };
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

    async updateUsersList(usersList: FollowingUser[], options: ExtensionOptions, ignorePollInterval = false) {
        const pollInterval = ignorePollInterval ? 0 : options.pollUserInterval * 1000;
        const notifyInfo: UserNotification = { type: NotificationId.user, items: [] };
        let updated = 0;
        for (let i = 0; i < usersList.length; i++) {
            const ts = Date.now();

            if (ts - (usersList[i].lastUpdate || 0) < pollInterval) {
                continue;
            }

            const { user, newItemsLen } = await this.updateFollowingUser(usersList[i]);

            usersList[i] = user;

            if (user.notify && newItemsLen) {
                const link = getUserProfileUrl(user.username, user.watch, options);
                notifyInfo.items.push({ len: newItemsLen, link, name: user.username });
            }

            user.lastUpdate = ts;
            updated += 1;
            if (i < usersList.length - 1) await wait(1000);
        }
        await storage.saveUsersList(usersList);

        if (notifyInfo.items.length) notify(notifyInfo, options.notificationSoundId);

        return updated;
    }

    async setAccessToken(accounts?: StorageFields['accounts']) {
        try {
            accounts = accounts || (await storage.getAccounts());
            const withScopes: RedditScope[] = [
                scopes.identity.id,
                scopes.read.id,
                scopes.privatemessages.id,
                scopes.history.id,
            ];
            const account = getAccountByScope(accounts, withScopes);
            if (!account) return this.clearAccessToken();
            const token = await auth.getAccessToken(account);
            this.reddit.setAccessToken(token || null);
        } catch (e) {
            if (isAuthError(e)) return this.onAuthError(e);
            console.log(e);
        }
    }

    async onAuthError(e: AuthError) {
        console.error(e);
        this.clearAccessToken();
        await storage.setAuthError(e);
        return null;
    }

    clearAccessToken() {
        this.reddit.setAccessToken(null);
    }

    async updateAllMail(accounts: StorageFields['accounts'], options: ExtensionOptions) {
        const msgNotify: MessageNotification = { type: NotificationId.mail, items: [] };

        for (const ac of Object.values(accounts || {})) {
            if (ac.auth.refreshToken && ac.checkMail && ac.auth.scope?.includes('privatemessages')) {
                const newMessages = await this.updateUnreadMsg(ac);
                if (newMessages?.length && ac.mailNotify) {
                    msgNotify.items.push({ username: ac.name || '', len: newMessages.length });
                }
                await wait(options.waitTimeout * 1000);
            }
        }
        if (msgNotify.items.length) notify(msgNotify, options.notificationSoundId);
    }

    async updateAccountInfo(user: AuthUser) {
        if (!user) return user;
        const ac: AuthUser = { ...user };
        try {
            if (ac?.auth.refreshToken) {
                if (!ac.auth.scope || !ac.auth.scope.includes(redditScopes.identity.id)) {
                    throw new AuthError("Extension doesn't have permissions to fetch user's identity", ac.id);
                }
                const token = await auth.getAccessToken(ac);

                this.reddit.setAccessToken(token || null);

                const response = await this.reddit.me();

                if (isErrorResponse(response)) {
                    console.error('Error during fetching account information', response);
                    ac.error = `Couldn\t fetch account information: ${response.message || ''}`;
                    return ac;
                }
                if (response.data) {
                    const d = response.data;
                    ac.redditId = d.id;
                    ac.name = d.name;
                    ac.img = d.icon_img;
                    ac.inboxCount = d.inbox_count;
                    ac.hasMail = d.has_mail;
                    ac.totalKarma = d.total_karma;
                }
            }
        } catch (error) {
            if (isAuthError(error)) {
                ac.auth.error = error.message;
                return ac;
            }
            ac.error = error?.message;
        }

        return ac;
    }

    /**
     * Update reddit accounts information and save them to the storage.
     * If id is passed then update only one account.
     */
    async updateAccounts(accounts: Record<string, AuthUser>, id?: string) {
        const updated = { ...accounts };
        const updateArray = !id ? Object.values(accounts) : [accounts[id]];
        for (const acc of updateArray) {
            updated[acc.id] = await this.updateAccountInfo(accounts[acc.id]);
        }
        // remove duplicates
        const names: string[] = [];
        const filtered = Object.fromEntries(
            Object.entries(updated).filter(([, v]) => {
                if (names.includes(v.name || '')) return false;
                if (v.name) names.push(v.name);
                return true;
            }),
        );

        await storage.saveAccounts(filtered);
    }

    /**
     * Update extension data and save into storage
     *
     * Sadly, currently it's impossible to reliably fetch new posts by 'fullname':
     * https://www.reddit.com/dev/api/#fullnames
     * Because query with `before=fullname` of a deleted post will return an empty array.
     * Hence updates inevitably stop after a while. Instead, we ask some last posts
     * and then save only new posts depending on their timestamp
     * */
    async update(isForcedByUser = false) {
        const {
            queries: queryData,
            queriesList,
            subredditList,
            subreddits: subData,
            accounts,
            options,
            usersList,
        } = await storage.getAllData();

        const { waitTimeout, limit = 10, notificationSoundId } = options;

        if (accounts) {
            await this.updateAllMail(accounts, options);
        }

        if (usersList?.length || subredditList?.length || queriesList?.length) {
            await this.setAccessToken(accounts);
        }

        if (usersList) {
            const updated = await this.updateUsersList(usersList, options, isForcedByUser);
            if (updated) await wait(waitTimeout * 1000);
        }

        let postNotif: PostNotification = { type: NotificationId.post, items: [] };
        for (const subOpts of subredditList) {
            if (subOpts.disabled) continue;

            // increase limit if it's the first update with filters
            const actualLimit =
                subOpts.filterOpts?.enabled && !subData[subOpts.id]?.lastPostCreated ? Math.max(limit, 25) : limit;

            const newPosts = await this.updateSubreddit({
                subOpts,
                subData: subData[subOpts.id],
                listing: { limit: actualLimit },
            });
            if (subOpts.notify && newPosts?.length) {
                const link = getSubredditUrl(subOpts.subreddit, options);
                postNotif.items.push({ name: subOpts.subreddit, len: newPosts.length, link });
            }
            await wait(waitTimeout * 1000);
        }
        if (postNotif.items.length) notify(postNotif, notificationSoundId);

        postNotif = { type: NotificationId.post, items: [] };

        for (const query of queriesList) {
            if (query.disabled) continue;

            const newMessages = await this.updateQuery({ query, queryData: queryData[query.id], listing: { limit } });
            if (query.notify && newMessages?.length) {
                postNotif.items.push({
                    name: query.name || query.query || '',
                    len: newMessages.length,
                    link: getSearchQueryUrl(query.query || '', query.subreddit, options),
                });
            }
            await wait(waitTimeout * 1000);
        }
        if (postNotif.items.length) notify(postNotif, notificationSoundId);
    }
}
