/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { browser } from 'webextension-polyfill-ts';
import DEFAULT_OPTIONS from '../options-default';
import type { RedditError, RedditMessage, RedditPost, RedditPostExtended } from '../reddit-api/reddit-types';
import type { ExtensionOptions } from '../types/extension-options';
import { filterKeys, filterPostDataProperties, generateId } from '../utils';
import { authDataDefault, dataFields } from './fields';
import type { AuthData, QueryOpts, StorageFields, SubredditData, SubredditOpts } from './storage-types';

const storage = {
    async getAuthData() {
        const result = await browser.storage.local.get(authDataDefault);
        return result as AuthData;
    },

    async getMessageData() {
        const { messages } = await browser.storage.local.get({ messages: {} });
        return messages as StorageFields['messages'];
    },

    async getOptions() {
        const { options } = await browser.storage.local.get({ options: DEFAULT_OPTIONS });
        return options as StorageFields['options'];
    },

    async getPinnedPostList() {
        const { pinnedPostList } = await browser.storage.local.get({ pinnedPostList: [] });
        return pinnedPostList as StorageFields['pinnedPostList'];
    },

    async getSubredditList() {
        const { subredditList } = await browser.storage.local.get({ subredditList: [] });
        return subredditList as StorageFields['subredditList'];
    },

    async getSubredditData() {
        const { subreddits } = await browser.storage.local.get({ subreddits: {} });
        return subreddits as StorageFields['subreddits'];
    },

    async getQueriesList() {
        const { queriesList } = await browser.storage.local.get({ queriesList: [] });
        return queriesList as StorageFields['queriesList'];
    },

    async getQueriesData() {
        const { queries } = await browser.storage.local.get({ queries: {} });
        return queries as StorageFields['queries'];
    },

    async getNotificationsData() {
        const { notifications } = await browser.storage.local.get({ notifications: [] });
        return notifications as StorageFields['notifications'];
    },

    async getAllData() {
        return browser.storage.local.get(dataFields) as Promise<StorageFields>;
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
            if (subOpts.subreddit !== current.subreddit) {
                storage.removeSubredditData(current.id).catch(console.error);
            }
            wasUpdated = true;
            return subOpts;
        });
        if (!wasUpdated) updatedList.push(subOpts);
        return browser.storage.local.set({ subredditList: updatedList } as Pick<StorageFields, 'subredditList'>);
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

    /** Update given subreddit or reddit search data object with new posts or error */
    updateWatchDataObject(
        watchData: SubredditData,
        posts: RedditPost[] | RedditPostExtended[],
        error: RedditError | null = null,
    ): SubredditData {
        const result = { ...watchData };
        if (posts && posts.length) {
            const savedPosts = result.posts || [];
            const ids = new Set(savedPosts.map((p) => p.data.id));
            const postFiltered = posts.map((p) => filterPostDataProperties(p)).filter((p) => !ids.has(p.data.id));
            result.posts = [...postFiltered, ...savedPosts];
            if (postFiltered[0]) {
                result.lastPost = postFiltered[0].data.name;
                result.lastPostCreated = postFiltered[0].data.created;
            }
        }

        result.error = error;
        result.lastUpdate = Date.now();
        return result;
    },

    async saveQueryData(
        queryId: string,
        {
            posts = [],
            error = null,
        }: {
            posts?: RedditPost[] | RedditPostExtended[];
            error?: RedditError | null;
        },
    ) {
        const data = await storage.getQueriesData();
        const current = data[queryId] || {};
        const updatedQuery = storage.updateWatchDataObject(current, posts, error);
        await browser.storage.local.set({ queries: { ...data, [queryId]: updatedQuery } });
    },

    async saveSubredditData(
        id: string,
        { posts = [], error = null }: { posts?: RedditPost[]; error?: RedditError | null } = {},
    ) {
        const data = await storage.getSubredditData();
        const current: SubredditData = data[id] || {};
        const updatedSubreddit: SubredditData = storage.updateWatchDataObject(current, posts, error);
        return browser.storage.local.set({ subreddits: { ...data, [id]: updatedSubreddit } });
    },

    async saveNotificationsData(id: string, data: string[]) {
        const prev = await storage.getNotificationsData();
        // limit length of the array in the storage
        const notifications: StorageFields['notifications'] = prev.slice(-9);
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
        const messages: StorageFields['messages'] = { ...prev, messages: [], count: 0 };
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

        await browser.storage.local.set({ subreddits } as Pick<StorageFields, 'subreddits'>);
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

    async removePostsFrom({ subredditId, searchId }: { subredditId?: string; searchId?: string }) {
        if (subredditId) {
            const subreddits = await storage.getSubredditData();
            subreddits[subredditId].posts = [];
            await browser.storage.local.set({ subreddits });
        }
        if (searchId) {
            const queries = await storage.getQueriesData();
            queries[searchId].posts = [];
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
        return browser.storage.local.set({ subredditList: updated } as Pick<StorageFields, 'subredditList'>);
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
            subreddits: StorageFields['subreddits'];
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
            const subreddits: StorageFields['subreddits'] = {};
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
