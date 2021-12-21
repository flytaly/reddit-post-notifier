/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import scopes from '@/reddit-api/scopes';
import { browser } from 'webextension-polyfill-ts';
import DEFAULT_OPTIONS from '../options-default';
import type { TokenResponseBody } from '../reddit-api/auth';
import type {
    RedditError,
    RedditItem,
    RedditMessage,
    RedditPost,
    RedditPostExtended,
} from '../reddit-api/reddit-types';
import type { ExtensionOptions } from '../types/extension-options';
import { filterKeys, filterPostDataProperties, generateId } from '../utils';
import { dataFields } from './fields';
import type {
    QueryData,
    QueryOpts,
    PostsToSaveData,
    StorageFields as SF,
    SubredditData,
    SubredditOpts,
    FollowingUser,
    StorageFields,
} from './storage-types';

const storage = {
    async getAccounts() {
        const { accounts } = await browser.storage.local.get({ accounts: {} });
        return accounts as SF['accounts'];
    },

    async getOptions() {
        const { options } = await browser.storage.local.get({ options: DEFAULT_OPTIONS });
        return options as SF['options'];
    },

    async getPinnedPostList() {
        const { pinnedPostList } = await browser.storage.local.get({ pinnedPostList: [] });
        return pinnedPostList as SF['pinnedPostList'];
    },

    async getSubredditList() {
        const { subredditList } = await browser.storage.local.get({ subredditList: [] });
        return subredditList as SF['subredditList'];
    },

    async getSubredditData() {
        const { subreddits } = await browser.storage.local.get({ subreddits: {} });
        return subreddits as SF['subreddits'];
    },

    async getQueriesList() {
        const { queriesList } = await browser.storage.local.get({ queriesList: [] });
        return queriesList as SF['queriesList'];
    },

    async getQueriesData() {
        const { queries } = await browser.storage.local.get({ queries: {} });
        return queries as SF['queries'];
    },

    async getUsersList() {
        const { usersList } = await browser.storage.local.get({ usersList: [] } as Pick<SF, 'usersList'>);
        return usersList as SF['usersList'];
    },

    async getNotificationsData() {
        const { notifications } = await browser.storage.local.get({ notifications: [] });
        return notifications as SF['notifications'];
    },

    async getAllData() {
        return browser.storage.local.get(dataFields) as Promise<SF>;
    },

    async saveAccounts(accounts: SF['accounts']) {
        return browser.storage.local.set({ accounts } as SF);
    },

    async saveAuthData({ id, data, error }: { data?: TokenResponseBody; id: string; error?: string }) {
        const accounts = await storage.getAccounts();
        if (!accounts[id]) accounts[id] = { id, auth: {} };
        const auth = accounts[id].auth;
        if (data) {
            auth.accessToken = data.access_token;
            auth.refreshToken = data.refresh_token;
            auth.scope = data.scope || '';
            auth.error = '';
            const expiresInRelative = data.expires_in || 0;
            auth.expiresIn = expiresInRelative && new Date().getTime() + +expiresInRelative * 1000;
        }
        if (error) {
            auth.error = error;
        }

        return browser.storage.local.set({ accounts } as StorageFields);
    },

    async saveMessageData(
        accId: string,
        { unreadMessages, error }: { unreadMessages?: RedditMessage[]; error?: RedditError | null },
    ) {
        const accs = await storage.getAccounts();
        if (!accs[accId]) accs[accId] = { id: accId, auth: {}, mail: { messages: [] } };
        if (error) {
            (accs[accId].error = "Couldn't fetch messages: "), error.message;
            return storage.saveAccounts(accs);
        }
        if (unreadMessages) {
            const mail = accs[accId].mail;
            const prevUnread = mail.messages || [];
            const ids = new Set<string>();
            mail.messages.forEach((m) => ids.add(m.data.id));
            unreadMessages = unreadMessages.filter((m) => !ids.has(m.data.id));
            mail.messages = [...unreadMessages, ...prevUnread];
            mail.lastUpdate = Date.now();
            if (unreadMessages[0]) mail.lastPostCreated = unreadMessages[0].data.created;
            return storage.saveAccounts(accs);
        }
    },

    async saveOptions(data: Partial<ExtensionOptions>) {
        const optionsPrev = await storage.getOptions();
        return browser.storage.local.set({ options: { ...optionsPrev, ...data } });
    },

    async savePinnedPost(post: RedditItem) {
        const prev = await storage.getPinnedPostList();
        if (prev.findIndex((p) => p.data.id === post.data.id) !== -1) {
            return;
        }
        return browser.storage.local.set({
            pinnedPostList: [post, ...prev],
        });
    },

    async saveSubredditList(subredditList: SubredditOpts[]) {
        await storage.prune({ subIdList: subredditList.map((s) => s.id) });
        return browser.storage.local.set({ subredditList });
    },

    async saveSubredditOpts(subOpts: SubredditOpts) {
        const sOpts = await storage.getSubredditList();
        let wasUpdated = false;
        const updatedList = sOpts.map((current) => {
            if (current.id !== subOpts.id) return current;
            // Clear if subreddit name changes
            if (subOpts.subreddit !== current.subreddit) {
                storage.removeSubredditData(current.id).catch(console.error);
            }
            wasUpdated = true;
            return subOpts;
        });
        if (!wasUpdated) updatedList.push(subOpts);
        return browser.storage.local.set({ subredditList: updatedList } as Pick<SF, 'subredditList'>);
    },

    async saveQuery(query: QueryOpts) {
        const queriesList = await storage.getQueriesList();
        const updateStatus = {
            wasUpdated: false,
            shouldClear: false,
        };

        const queriesUpdated = queriesList.map((q: QueryOpts) => {
            const { id, subreddit: prevSubreddit, query: prevQuery } = q;
            if (id !== query.id) return q;

            if (prevQuery !== query.query || prevSubreddit !== query.subreddit) {
                updateStatus.shouldClear = true;
            }
            updateStatus.wasUpdated = true;
            return query;
        });

        if (!updateStatus.wasUpdated) queriesUpdated.push(query);
        if (updateStatus.shouldClear) {
            await storage.removeQueryData(query.id);
        }
        return browser.storage.local.set({ queriesList: queriesUpdated });
    },

    saveUsersList(usersList: FollowingUser[]) {
        return browser.storage.local.set({ usersList } as Pick<SF, 'usersList'>);
    },

    /** Update given subreddit or reddit search data object with new posts or error */
    updateWatchDataObject(
        prevData: SubredditData | QueryData,
        { posts: newPosts = [], error = null, limit = 50, lastPostCreated }: PostsToSaveData = {},
    ): SubredditData {
        const result = { ...prevData };
        if (newPosts && newPosts.length) {
            const savedPosts = prevData.posts || [];
            const ids = new Set(savedPosts.map((p) => p.data.id));
            const postFiltered = newPosts
                .map((p: RedditPost | RedditPostExtended) => filterPostDataProperties(p))
                .filter((p) => !ids.has(p.data.id));
            result.posts = [...postFiltered, ...savedPosts].slice(0, limit);
            if (postFiltered[0]) {
                result.lastPost = postFiltered[0].data.name;
                result.lastPostCreated = lastPostCreated || postFiltered[0].data.created;
            }
        }

        result.error = error;
        result.lastUpdate = Date.now();
        return result;
    },

    async saveQueryData(queryId: string, postData: PostsToSaveData) {
        const data = await storage.getQueriesData();
        const current = data[queryId] || {};
        const updatedQuery = storage.updateWatchDataObject(current, postData);
        await browser.storage.local.set({ queries: { ...data, [queryId]: updatedQuery } });
    },

    async saveSubredditData(id: string, postData: PostsToSaveData) {
        const prevData = await storage.getSubredditData();
        const current: SubredditData = prevData[id] || {};
        const updatedSubreddit: SubredditData = storage.updateWatchDataObject(current, postData);
        return browser.storage.local.set({ subreddits: { ...prevData, [id]: updatedSubreddit } });
    },

    async saveNotificationsData(id: string, data: string[]) {
        const prev = await storage.getNotificationsData();
        // limit length of the array in the storage
        const notifications: SF['notifications'] = prev.slice(-9);
        notifications.push({ id, data });
        return browser.storage.local.set({ notifications });
    },

    async clearAuthData() {
        // TODO:
        // return browser.storage.local.set(authDataDefault);
    },

    async clearStorage() {
        return browser.storage.local.clear();
    },

    async removeMessages(accId: string) {
        const accounts = await storage.getAccounts();
        if (!accounts[accId]?.mail) return;
        accounts[accId].mail.messages = [];
        await browser.storage.local.set({ accounts } as SF);
    },

    async removeQueryData(queryId: string) {
        const queries = await storage.getQueriesData();
        queries[queryId] = { posts: [] };
        await browser.storage.local.set({ queries });
    },

    async removeSubredditData(id: string) {
        const subreddits = await storage.getSubredditData();
        subreddits[id] = { posts: [] };

        await browser.storage.local.set({ subreddits } as Pick<SF, 'subreddits'>);
    },

    async removePost({
        id,
        subreddit,
        searchId,
        accountId,
    }: {
        id: string;
        subreddit?: string;
        searchId?: string;
        accountId?: string;
    }) {
        if (subreddit) {
            const subreddits = await storage.getSubredditData();

            subreddits[subreddit].posts = subreddits[subreddit].posts.filter(({ data }) => data.id !== id);

            await browser.storage.local.set({ subreddits });
        }

        if (searchId) {
            const queries = await storage.getQueriesData();
            queries[searchId].posts = queries[searchId].posts.filter(({ data }) => data.id !== id);
            await browser.storage.local.set({ queries });
        }

        if (accountId) {
            const accounts = await storage.getAccounts();
            const messages = accounts[accountId]?.mail?.messages?.filter(({ data }) => data.id !== id);
            if (!messages) return;
            accounts[accountId].mail.messages = messages;
            await storage.saveAccounts(accounts);
        }
    },

    async removeUserPost({ userIndex, postId }: { userIndex: number; postId: string }) {
        const usersList = await storage.getUsersList();
        if (usersList[userIndex]?.data) {
            usersList[userIndex].data = usersList[userIndex].data.filter((item) => item.data.id !== postId);
            await storage.saveUsersList(usersList);
        }
    },

    async removePinPost(id: string) {
        const pinnedPostList = await storage.getPinnedPostList();
        return browser.storage.local.set({
            pinnedPostList: pinnedPostList.filter((p) => p.data.id !== id),
        });
    },

    async removePostsFrom({
        subredditId,
        searchId,
        followUserIndex,
        clearTS,
    }: {
        subredditId?: string;
        searchId?: string;
        followUserIndex?: number;
        /** clear the last post timestamp  */
        clearTS?: boolean;
    }) {
        if (subredditId) {
            const subreddits = await storage.getSubredditData();
            subreddits[subredditId].posts = [];
            if (clearTS) subreddits[subredditId].lastPostCreated = null;
            await browser.storage.local.set({ subreddits });
        }
        if (searchId) {
            const queries = await storage.getQueriesData();
            queries[searchId].posts = [];
            if (clearTS) queries[searchId].lastPostCreated = null;
            await browser.storage.local.set({ queries });
        }
        if (followUserIndex !== undefined) {
            const usersList = await storage.getUsersList();
            usersList;
            usersList[followUserIndex].data = [];
            if (clearTS) usersList[followUserIndex].lastPostCreated = null;
            await storage.saveUsersList(usersList);
        }
    },

    async removeAllPosts() {
        const { queries, subreddits, usersList } = await storage.getAllData();

        Object.keys(subreddits).forEach((subr) => {
            subreddits[subr].posts = [];
        });
        Object.keys(queries).forEach((q) => {
            queries[q].posts = [];
        });
        usersList.forEach((u) => {
            u.data = [];
        });

        await browser.storage.local.set({ subreddits, queries, usersList });
    },

    async removeSubreddits(ids = [] as string[]) {
        const subredditList = await storage.getSubredditList();
        const updated = subredditList.filter((q) => !ids.includes(q.id));
        await storage.prune({ subIdList: updated.map((s) => s.id) });
        return browser.storage.local.set({ subredditList: updated } as Pick<SF, 'subredditList'>);
    },

    async removeQueries(ids = [] as string[]) {
        const queriesList = await storage.getQueriesList();
        const queriesUpdated = queriesList.filter((q) => !ids.includes(q.id));
        await storage.prune({ queriesIdList: queriesUpdated.map((q) => q.id) });
        return browser.storage.local.set({ queriesList: queriesUpdated });
    },

    async removeNotificationData(id: string) {
        const prev = await storage.getNotificationsData();
        const notifications = prev.filter((n) => n.id !== id);
        return browser.storage.local.set({ notifications });
    },

    /** Remove unused data */
    async prune({ subIdList, queriesIdList }: { subIdList?: string[]; queriesIdList?: string[] }) {
        if (subIdList) {
            const subs = await storage.getSubredditData();
            if (subs) {
                return browser.storage.local.set({ subreddits: filterKeys(subIdList, subs) });
            }
        }

        if (queriesIdList) {
            const queries = await storage.getQueriesData();
            if (queries) {
                return browser.storage.local.set({ queries: filterKeys(queriesIdList, queries) });
            }
        }
    },

    async countNumberOfUnreadItems(updateBadge = true) {
        let count = 0;
        const { subredditList, queriesList, queries, subreddits, accounts, usersList } = await storage.getAllData();

        if (subreddits) {
            subredditList?.forEach((s) => {
                count += subreddits[s.id]?.posts?.length || 0;
            });
        }

        if (queries) {
            queriesList?.forEach((q) => {
                count += queries[q.id]?.posts?.length || 0;
            });
        }

        usersList?.forEach((u) => {
            count += u.data?.length || 0;
        });

        Object.values(accounts)?.forEach((a) => {
            count += a.mail?.messages?.length || 0;
        });

        if (updateBadge) void browser.browserAction.setBadgeText({ text: count ? String(count) : '' });

        return count;
    },

    /**
     * Convert
     * 1) subreddit list to object list:  string[] => SubredditOpts[]
     * 2) subreddits data: Record<"subreddit name", {}> => Record<"id", {}>
     * */
    async migrateToV4() {
        const data = (await browser.storage.local.get({
            options: {},
            subredditList: [],
            subreddits: {},
            accessToken: '',
            expiresIn: 0,
            refreshToken: '',
            scope: '',
            messages: {},
        })) as {
            options: {
                messages: boolean;
                messagesNotify: boolean;
                subredditNotify?: boolean;
            };
            subredditList?: string[];
            subreddits?: SF['subreddits'];
            accessToken?: string;
            expiresIn?: number;
            refreshToken?: string;
            scope?: string;
            messages: {
                count?: number;
                lastPostCreated?: number;
                lastUpdate?: number;
                messages?: RedditMessage[];
            };
        };

        // const obj: Pick<StorageFields, 'accessToken' | 'refreshToken' | 'expiresIn'>;
        const notifyDefault = !!data.options.subredditNotify;
        const prevSubList = data.subredditList;
        const prevSubData = data.subreddits;
        const updated: Partial<StorageFields> = {};
        if (prevSubList) {
            const subredditList: SubredditOpts[] = [];
            prevSubList.forEach((subreddit) => {
                if (typeof subreddit !== 'string') return;
                subredditList.push({ id: generateId(), subreddit, notify: notifyDefault } as SubredditOpts);
            });

            const subreddits: SF['subreddits'] = {};
            subredditList.forEach((opts) => {
                if (!opts?.subreddit) return;
                const subData = prevSubData[opts.subreddit];
                if (subData) {
                    subreddits[opts.id] = subData;
                }
            });
            updated.subreddits = subreddits;
            updated.subredditList = subredditList;
        }
        const id = generateId();
        if (data.refreshToken) {
            updated.accounts = {
                [id]: {
                    id,
                    auth: {
                        refreshToken: data.refreshToken,
                        scope: data.scope || `${scopes.read.id} ${scopes.privatemessages.id}`,
                        accessToken: data.accessToken,
                        expiresIn: data.expiresIn,
                    },
                    mail: {
                        messages: data.messages?.messages || [],
                    },
                    mailNotify: data.options.messagesNotify,
                    checkMail: data.options.messages,
                },
            };
        }
        await browser.storage.local.set(updated);
    },
};

export default storage;
