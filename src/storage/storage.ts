/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { browser } from 'webextension-polyfill-ts';
import DEFAULT_OPTIONS from '../options-default';
import type { RedditMessage, RedditPost, RedditPostExtended } from '../reddit-api/reddit-types';
import type { ExtensionOptions } from '../types/extension-options';
import { filterKeys, filterPostDataProperties, generateId } from '../utils';
import { authDataDefault, dataFields } from './fields';
import type {
    AuthData,
    QueryData,
    QueryOpts,
    PostsToSaveData,
    StorageFields as SF,
    SubredditData,
    SubredditOpts,
    FollowingUser,
} from './storage-types';

const storage = {
    async getAuthData() {
        const result = await browser.storage.local.get(authDataDefault);
        return result as AuthData;
    },

    async getMessageData() {
        const { messages } = await browser.storage.local.get({ messages: {} });
        return messages as SF['messages'];
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

    getUsersList() {
        return browser.storage.local.get({ usersList: [] } as Pick<SF, 'usersList'>);
    },

    async getNotificationsData() {
        const { notifications } = await browser.storage.local.get({ notifications: [] });
        return notifications as SF['notifications'];
    },

    async getAllData() {
        return browser.storage.local.get(dataFields) as Promise<SF>;
    },

    async saveAuthData(data: { access_token?: string; expires_in?: number | string; refresh_token?: string }) {
        const {
            access_token: accessToken, //
            expires_in: expiresInRelative,
            refresh_token: refreshToken,
        } = data;

        const expiresIn: number | undefined = expiresInRelative && new Date().getTime() + +expiresInRelative * 1000;

        return browser.storage.local.set({
            ...(accessToken && { accessToken }),
            ...(refreshToken && { refreshToken }),
            ...(expiresIn && { expiresIn }),
        });
    },

    async saveMessageData({ newMessages, count }: { newMessages: RedditMessage[]; count: number }) {
        const data = await storage.getMessageData();
        data.messages = data.messages || [];
        if (count === 0) {
            data.messages = [];
        } else if (newMessages) {
            data.messages = [...newMessages, ...data.messages];
        }

        if (newMessages && newMessages[0]) data.lastPostCreated = newMessages[0].data.created;

        data.count = count;
        data.lastUpdate = Date.now();

        await browser.storage.local.set({ messages: data });
    },

    async saveOptions(data: Partial<ExtensionOptions>) {
        const optionsPrev = await storage.getOptions();
        return browser.storage.local.set({ options: { ...optionsPrev, ...data } });
    },

    async savePinnedPost(post: RedditPost) {
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
        return browser.storage.local.set(authDataDefault);
    },

    async clearStorage() {
        return browser.storage.local.clear();
    },

    async removeMessages() {
        const prev = await storage.getMessageData();
        const messages: SF['messages'] = { ...prev, messages: [], count: 0 };
        await browser.storage.local.set({ messages });
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

    async removePost({ id, subreddit, searchId }: { id: string; subreddit?: string; searchId?: string }) {
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
        clearTS,
    }: {
        subredditId?: string;
        searchId?: string;
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
    },

    async removeAllPosts() {
        const [subreddits = {}, queries = {}] = await Promise.all([
            storage.getSubredditData(),
            storage.getQueriesData(),
        ]);

        Object.keys(subreddits).forEach((subr) => {
            subreddits[subr].posts = [];
        });
        Object.keys(queries).forEach((q) => {
            queries[q].posts = [];
        });

        await browser.storage.local.set({ subreddits, queries });
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
        const { subredditList, queriesList, queries, subreddits, messages } = await storage.getAllData();

        if (subredditList?.length && subreddits) {
            count += subredditList.reduce((acc, curr) => {
                const id = curr.id;
                if (subreddits[id] && subreddits[id].posts) return acc + subreddits[id].posts.length;
                return acc;
            }, 0);
        }

        if (queriesList && queriesList.length && queries) {
            count += queriesList.reduce((acc, curr) => {
                if (queries[curr.id] && queries[curr.id].posts) return acc + queries[curr.id].posts.length;
                return acc;
            }, 0);
        }

        if (messages && messages.count) count += messages.count;

        if (updateBadge) void browser.browserAction.setBadgeText({ text: count ? String(count) : '' });

        return count;
    },

    /**
     * Convert subreddit list to object list:  string[] => SubredditOpts[]
     * and subreddits data: Record<"subreddit name", {}> => Record<"id", {}>
     * */
    async migrateToV4() {
        const data = (await browser.storage.local.get({ options: {}, subredditList: [], subreddits: {} })) as {
            options: { subredditNotify?: boolean };
            subredditList: string[];
            subreddits: SF['subreddits'];
        };
        const notifyDefault = !!data.options.subredditNotify;
        const prevSubList = data.subredditList;
        const prevSubData = data.subreddits;
        if (prevSubList) {
            const subredditList = prevSubList.map((subreddit) => {
                if (typeof subreddit !== 'string') return;
                return { id: generateId(), subreddit, notify: notifyDefault } as SubredditOpts;
            });
            /** Port from */
            const subreddits: SF['subreddits'] = {};
            subredditList.forEach((opts) => {
                const subData = prevSubData[opts.subreddit];
                if (subData) {
                    subreddits[opts.id] = subData;
                }
            });
            await browser.storage.local.set({ subredditList, subreddits });
        }
    },
};

export default storage;
