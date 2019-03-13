const storage = {
    async getAuthData(keys = ['accessToken', 'expiresIn', 'refreshToken']) {
        return browser.storage.local.get(keys);
    },

    async getMessageData() {
        const { messages } = await browser.storage.local.get({ messages: {} });
        return messages;
    },

    async getOptions() {
        const { options } = await browser.storage.local.get('options');
        return options;
    },

    async getSubredditData() {
        const { subreddits } = await browser.storage.local.get({ subreddits: {} });
        return subreddits;
    },

    async getQueriesList() {
        const { queriesList } = await browser.storage.local.get({ queriesList: [] });
        return queriesList;
    },

    async getQueriesData() {
        const { queries } = await browser.storage.local.get({ queries: {} });
        return queries;
    },

    /**
     * @param {Object} data
     */
    async saveAuthData(data) {
        const {
            access_token: accessToken,
            expires_in: expiresInRelative,
            refresh_token: refreshToken,
            // token_type: tokenType,
            // scope,
        } = data;

        const expiresIn = expiresInRelative && (new Date().getTime() + expiresInRelative * 1000);

        return browser.storage.local.set({
            ...(accessToken && { accessToken }),
            ...(refreshToken && { refreshToken }),
            ...(expiresIn && { expiresIn }),
        });
    },

    async saveMessageData({ newMessages, count }) {
        const data = await storage.getMessageData() || {};
        data.messages = data.messages || [];
        if (count === 0) {
            data.messages = [];
        } else if (newMessages) data.messages.unshift(...newMessages);

        if (newMessages && newMessages[0]) data.lastPostCreated = newMessages[0].data.created;

        data.count = count;

        data.lastUpdate = Date.now();

        await browser.storage.local.set({ messages: data });
    },

    /**
     * @param {Object} data
     */
    async saveOptions(data) {
        const optionsPrev = await this.getOptions();
        return browser.storage.local.set({ options: { ...optionsPrev, ...data } });
    },

    async saveQuery(query) {
        const queriesList = await storage.getQueriesList();
        let wasUpdated = false;
        const queriesUpdated = queriesList.map((q) => {
            if (q.id !== query.id) return q;
            wasUpdated = true;
            return query;
        });
        if (!wasUpdated) queriesUpdated.push(query);
        return browser.storage.local.set({ queriesList: queriesUpdated });
    },

    async saveQueryData(queryId, { posts, error }) {
        const data = await storage.getQueriesData();
        const current = data[queryId] || {};
        if (posts) {
            const savedPosts = current.posts || [];
            current.posts = [...posts, ...savedPosts];
            current.error = null;
            if (posts[0]) {
                current.lastPostCreated = posts[0].data.created;
            }
        }
        if (error) {
            current.error = error;
        }

        current.lastUpdate = Date.now();

        await browser.storage.local.set({ queries: { ...data, [queryId]: current } });
    },

    async saveSubredditData(subreddit, { posts, error }) {
        const data = await storage.getSubredditData();
        const current = data[subreddit] || {};

        if (posts) {
            const savedPosts = current.posts || [];
            current.posts = [...posts, ...savedPosts];
            current.error = null;
            if (posts[0]) {
                current.lastPost = posts[0].data.name;
                current.lastPostCreated = posts[0].data.created;
            }
        }
        if (error) {
            current.error = error;
        }

        current.lastUpdate = Date.now();

        return browser.storage.local.set({ subreddits: { ...data, [subreddit]: current } });
    },

    async removeMessages() {
        const { messages } = await browser.storage.local.get({ messages: {} });
        await browser.storage.local.set({ messages: { ...messages, messages: [], count: 0 } });
    },

    async removePost({ id, subreddit, searchId }) {
        if (subreddit) {
            const subreddits = await storage.getSubredditData();

            subreddits[subreddit].posts = subreddits[subreddit]
                .posts
                .filter(({ data }) => data.id !== id);

            await browser.storage.local.set({ subreddits });
        }

        if (searchId) {
            const queries = await storage.getQueriesData();
            queries[searchId].posts = queries[searchId]
                .posts
                .filter(({ data }) => data.id !== id);

            await browser.storage.local.set({ queries });
        }
    },

    async removePostsFrom({ subreddit, searchId }) {
        if (subreddit) {
            const subreddits = await storage.getSubredditData();
            subreddits[subreddit].posts = [];
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

    async removeQueries(ids = []) {
        const queriesList = await storage.getQueriesList();
        const queriesUpdated = queriesList.filter(q => !ids.includes(q.id));

        return browser.storage.local.set({ queriesList: queriesUpdated });
    },
    /**
     * Remove unused data
     */
    async prune(options) {
        // eslint-disable-next-line no-param-reassign
        if (!options) options = await this.getOptions();

        const { watchSubreddits = [] } = options;
        const subreddits = await storage.getSubredditData();
        if (subreddits) {
            const pruned = Object
                .keys(subreddits)
                .reduce((acc, sub) => {
                    if (watchSubreddits.includes(sub)) {
                        acc[sub] = subreddits[sub];
                    }
                    return acc;
                }, {});
            await browser.storage.local.set({ subreddits: pruned });
        }
    },

    async countNumberOfUnreadItems() {
        let count = 0;
        const {
            options, queriesList, queries, subreddits, messages,
        } = await browser.storage.local.get();

        if (options.watchSubreddits && options.watchSubreddits.length && subreddits) {
            count += options.watchSubreddits.reduce((acc, curr) => {
                if (subreddits[curr] && subreddits[curr].posts) return acc + subreddits[curr].posts.length;
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

        return count;
    },
};

/** Higher-order function that updates badge after every change in storage */
const wrapper = func => async (...args) => {
    const results = await func(...args);
    (async () => {
        const countItems = await storage.countNumberOfUnreadItems();
        browser.browserAction.setBadgeText({ text: countItems ? String(countItems) : '' });
    })();
    return results;
};

const proxy = new Proxy(storage, {
    get(target, prop) {
        if (typeof prop !== 'string') return target[prop]; // prop could be Symbol.toStringTag

        if (prop.startsWith('remove') || prop.startsWith('save')) {
            return wrapper(target[prop].bind(target));
        }

        return target[prop];
    },
});

export default proxy;
