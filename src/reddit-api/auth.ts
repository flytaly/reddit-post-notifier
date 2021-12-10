import { config } from '../constants';
import { AuthError } from './errors';
import scopes from './scopes';
import storage from '../storage';
import { mapObjToQueryStr } from '../utils';
import { browser } from 'webextension-polyfill-ts';

const { clientId, clientSecret, redirectUri, userAgent } = config;

export type TokenResponseBody = {
    access_token: string;
    refresh_token: string;
    expires_in: string;
    scope: string;
    token_type: string;
    error?: string;
};

const BASE_URL = 'https://www.reddit.com/api/v1';

/**
 * Reddit OAuth2 code flow:
 * https://github.com/reddit-archive/reddit/wiki/OAuth2#token-retrieval-code-flow
 */
const auth = {
    authState: '',

    get accessTokenURL() {
        return `${BASE_URL}/access_token`;
    },

    /**
     * Get accessToken from storage. If there is no token
     * or current token is outdated retrieve new one from OAUTH server.
     */
    async getAccessToken(): Promise<string | null> {
        const { accessToken, expiresIn, refreshToken } = await storage.getAuthData();
        if (!refreshToken) return null;
        const now = new Date();
        const expires = new Date(expiresIn - 60000 * 4); // 4 mins before expire

        const token: string = expires > now && accessToken ? accessToken : await auth.renewAccessToken(refreshToken);
        return token;
    },

    generateAuthState(): string {
        return (Math.random() * Number.MAX_SAFE_INTEGER).toString(36);
    },

    getAuthURL(authState: string): string {
        const params = {
            response_type: 'code',
            redirect_uri: encodeURIComponent(redirectUri),
            client_id: clientId,
            scope: `${scopes.identity.id} ${scopes.read.id} ${scopes.privatemessages.id} ${scopes.history.id}`,
            state: authState,
            duration: 'permanent',
        };
        return `${BASE_URL}/authorize?${mapObjToQueryStr(params)}`;
    },

    async getAuthCode(authState: string) {
        const response = await browser.identity.launchWebAuthFlow({
            url: auth.getAuthURL(authState),
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

    fetchAuthInit(params: Record<string, string>) {
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

    async getTokens(code: string): Promise<TokenResponseBody> {
        const params = {
            grant_type: 'authorization_code',
            redirect_uri: encodeURIComponent(redirectUri),
            code,
        };

        const response = await fetch(auth.accessTokenURL, auth.fetchAuthInit(params));
        if (response.status !== 200) {
            throw new AuthError(`Couldn't receive tokens. ${response.status}: ${response.statusText || ''}`);
        }

        const body = (await response.json()) as TokenResponseBody;
        if (body.error) {
            throw new AuthError(`Couldn't receive tokens. Error: ${body.error}`);
        }

        return body;
    },

    /**
     * @return accessToken
     */
    async renewAccessToken(refreshToken: string): Promise<string> {
        const params = {
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        };
        const response = await fetch(auth.accessTokenURL, auth.fetchAuthInit(params));

        if (response.status !== 200) {
            throw new AuthError(`Couldn't refresh access token. ${response.status}: ${response.statusText || ''}`);
        }
        const body = (await response.json()) as TokenResponseBody;
        if (body.error) {
            throw new AuthError(`Couldn't refresh access token. Error: ${body.error}`);
        }

        await storage.saveAuthData(body);

        return body.access_token;
    },

    /** Start OAUTH2 authorization flow */
    async login() {
        auth.authState = auth.generateAuthState();
        const code = await auth.getAuthCode(auth.authState);
        if (!code) throw new AuthError("Couldn't get auth code");

        const authData = await auth.getTokens(code);
        await storage.saveAuthData(authData);
    },
};

export default auth;
