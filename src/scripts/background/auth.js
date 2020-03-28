import {
    clientId, clientSecret, redirectUri, userAgent,
} from '../config';
import { AuthError } from './errors';
import scopes from '../reddit-scopes';
import storage from '../storage';
import { mapObjToQueryStr } from '../utils';

/**
 * Reddit OAuth2 code flow: https://github.com/reddit-archive/reddit/wiki/OAuth2#token-retrieval-code-flow
 */
const auth = {
    baseURL: 'https://www.reddit.com/api/v1',

    get accessTokenURL() {
        return `${this.baseURL}/access_token`;
    },

    /**
     * Get accessToken from storage. If there is no token
     * or current token is outdated retrieve new one from OAUTH server.
     * @return {Promise<string>} accessToken
     */
    async getAccessToken() {
        const { accessToken, expiresIn, refreshToken } = await storage.getAuthData();
        if (!refreshToken) return this.setAuth();
        const now = new Date();
        const expires = new Date(expiresIn - 60000 * 2); // 2 mins before expire

        const token = expires > now ? accessToken : await this.renewAccessToken(refreshToken);
        return token;
    },

    generateAuthState() {
        return (Math.random() * Number.MAX_SAFE_INTEGER).toString(36);
    },

    getAuthURL(authState) {
        const params = {
            response_type: 'code',
            redirect_uri: encodeURIComponent(redirectUri),
            client_id: clientId,
            scope: `${scopes.read.id} ${scopes.privatemessages.id}`,
            state: authState,
            duration: 'permanent',
        };
        return `${this.baseURL}/authorize?${mapObjToQueryStr(params)}`;
    },

    async getAuthCode(authState) {
        const response = await browser.identity.launchWebAuthFlow({
            url: this.getAuthURL(authState),
            interactive: true,
        });
        const responseURL = new URL(response);

        if (responseURL.searchParams.has('error')) {
            throw new AuthError(responseURL.searchParams.get('error'));
        }
        if (responseURL.searchParams.get('state') === authState) {
            return responseURL.searchParams.get('code');
        }
        return false;
    },

    fetchAuthInit(params) {
        const base64Credentials = btoa(`${clientId}:${clientSecret}`);
        return {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                Authorization: `Basic ${base64Credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': userAgent,
            },
            body: mapObjToQueryStr(params),
        };
    },

    /**
     * @param {string} code
     * @typedef {Object} response_body
     * @property {string} access_token
     * @property {string} refresh_token
     * @property {string} expires_in
     * @property {string} scope
     * @property {string} token_type
     * @returns {Promise<response_body>}
     */
    async getTokens(code) {
        const params = {
            grant_type: 'authorization_code',
            redirect_uri: encodeURIComponent(redirectUri),
            code,
        };

        const response = await fetch(this.accessTokenURL, this.fetchAuthInit(params));
        if (response.status !== 200) {
            throw new AuthError(`Couldn't receive tokens. ${response.status}: ${response.statusText}`);
        }

        const body = await response.json();
        if (body.error) {
            throw new AuthError(`Couldn't receive tokens. Error: ${body.error}`);
        }
        return body;
    },

    /**
     * @param {string} refreshToken
     * @return {Promise<string>} accessToken
     */
    async renewAccessToken(refreshToken) {
        const params = {
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        };
        const response = await fetch(this.accessTokenURL, this.fetchAuthInit(params));

        if (response.status !== 200) {
            throw new AuthError(`Couldn't refresh access token. ${response.status}: ${response.statusText}`);
        }
        const body = await response.json();
        if (body.error) {
            throw new AuthError(`Couldn't refresh access token. Error: ${body.error}`);
        }
        await storage.saveAuthData(body);

        return body.access_token;
    },

    /**
     * Start OAUTH2 authorization flow
     * @return {Promise<string>} accessToken
     */
    async login() {
        this.authState = this.generateAuthState();
        const code = await this.getAuthCode(this.authState);
        if (!code) throw new AuthError('Couldn\'t get auth code');

        const authData = await this.getTokens(code);
        await storage.saveAuthData(authData);

        if (this.authPromiseResolveFn) this.authPromiseResolveFn(authData.access_token);
    },


    authPromiseResolveFn: null,

    /**
        Change popup to popup with authorization button.
        Returns promise that will be fulfilled only after a successful login
        @return {Promise<string>} accessToken
    */
    setAuth() {
        // browser.browserAction.setPopup({ popup: '' });
        browser.browserAction.setBadgeText({ text: '...' });
        browser.browserAction.setBadgeBackgroundColor({ color: 'red' });
        browser.browserAction.setPopup({ popup: browser.extension.getURL('popup_noauth.html') });

        return new Promise((resolve) => {
            this.authPromiseResolveFn = () => {
                browser.browserAction.setPopup({ popup: browser.extension.getURL('popup.html') });
                browser.browserAction.setBadgeText({ text: '' });
                resolve();
            };
        });
        /*
            return new Promise((resolve) => {
            const listener = async () => {
                try {
                    const token = await this.login();
                    browser.browserAction.setPopup({ popup: browser.extension.getURL('popup.html') });
                    browser.browserAction.onClicked.removeListener(listener);
                    browser.browserAction.setBadgeText({ text: '' });
                    resolve(token);
                } catch (e) {
                    console.error(e);
                }
            };
            browser.browserAction.onClicked.addListener(listener);
        });
        */
    },


};

export default auth;
