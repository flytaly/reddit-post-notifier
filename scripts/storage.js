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
};

export default storage;
