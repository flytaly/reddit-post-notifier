const storage = {
    async getAuthData(keys = ['accessToken', 'expiresIn', 'refreshToken']) {
        return browser.storage.local.get(keys);
    },

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
};

export default storage;
