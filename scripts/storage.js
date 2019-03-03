const storage = {
    async getAuthData(keys = ['accessToken', 'expiresIn', 'refreshToken']) {
        return browser.storage.local.get(keys);
    },

    async getOptions() {
        const { options } = await browser.storage.local.get('options');
        return options;
    },

    /**
     * @param {Object} data
     */
    async saveAuthData(data) {
        const {
            access_token: accessToken,
            expires_in: expiresIn,
            refresh_token: refreshToken,
            // token_type: tokenType,
            // scope,
        } = data;

        const expiresInRelative = expiresIn && (new Date().getTime() + expiresIn * 1000);

        return browser.storage.local.set({
            ...(accessToken && { accessToken }),
            ...(refreshToken && { refreshToken }),
            ...(expiresInRelative && { expiresIn: expiresInRelative }),
        });
    },

    /**
     * @param {Object} data
     */
    async saveOptions(data) {
        const optionsPrev = await this.getOptions();
        return browser.storage.local.set({ options: { ...optionsPrev, ...data } });
    },
};

export default storage;
