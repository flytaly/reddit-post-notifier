const storage = {
    async getAuthData(keys = ['accessToken', 'expiresIn', 'refreshToken']) {
        return browser.storage.local.get(keys);
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

    async removePost({ id, subreddit }) {
        if (subreddit) {
            const subreddits = await storage.getSubredditData();

            subreddits[subreddit].posts = subreddits[subreddit]
                .posts
                .filter(({ data }) => data.id !== id);

            return browser.storage.local.set({ subreddits });
        }

        return false;
    },

    async removePostsFrom({ subreddit }) {
        if (subreddit) {
            const subreddits = await storage.getSubredditData();
            subreddits[subreddit].posts = [];
            await browser.storage.local.set({ subreddits });
        }
    },

    async removeAllPosts() {
        const subreddits = await storage.getSubredditData();
        Object.keys(subreddits).forEach((subr) => {
            subreddits[subr].posts = [];
        });
        await browser.storage.local.set({ subreddits });
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
};

export default storage;
