import { clientId, clientSecret, redirectUri } from '../config';
import { AuthError } from './errors';
import scopes from '../reddit-scopes';
import storage from '../storage';

const mapObjToQueryStr = params => Object.entries(params).map(pair => pair.join('=')).join('&');

/*
    reddit OAuth2 code flow:  https://github.com/reddit-archive/reddit/wiki/OAuth2#token-retrieval-code-flow
*/
const auth = {
    baseURL: 'https://www.reddit.com/api/v1',

    get accessTokenURL() {
        return `${this.baseURL}/access_token`;
    },

    generateAuthState() {
        return (Math.random() * Number.MAX_SAFE_INTEGER).toString(36);
    },

    getAuthURL(authState) {
        const params = {
            response_type: 'code',
            redirect_uri: encodeURIComponent(redirectUri),
            client_id: clientId,
            scope: scopes.mysubreddits.id,
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
            },
            body: mapObjToQueryStr(params),
        };
    },

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

    async refreshToken(token) {
        try {
            const params = {
                grant_type: 'refresh_token',
                refresh_token: token,
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
        } catch (e) {
            console.error(e);
            await this.setAuth();
        }
    },

    async login() {
        const authState = this.generateAuthState();
        const code = await this.getAuthCode(authState);
        if (!code) throw new Error('Couldn\'t get auth code');

        const authData = await this.getTokens(code);
        await storage.saveAuthData(authData);
    },

    /*
        Initiate authentication next time user click badge.
        Returns promise that will be fulfilled only after a successful login
    */
    setAuth() {
        browser.browserAction.setPopup({ popup: '' });
        browser.browserAction.setBadgeBackgroundColor({ color: 'red' });
        browser.browserAction.setBadgeText({ text: '...' });
        return new Promise((resolve) => {
            const listener = async () => {
                try {
                    await this.login();
                    browser.browserAction.setPopup({ popup: browser.extension.getURL('popup/popup.html') });
                    browser.browserAction.onClicked.removeListener(listener);
                    resolve();
                } catch (e) {
                    console.error(`${e.name}: ${e.message}`);
                }
            };
            browser.browserAction.onClicked.addListener(listener);
        });
    },


};

export default auth;
