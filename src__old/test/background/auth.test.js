import browser from 'sinon-chrome/webextensions';
import auth from '../../scripts/background/auth';
import * as config from '../../scripts/config';
import scopes from '../../scripts/reddit-scopes';
import storage from '../../scripts/storage';
import { AuthError } from '../../scripts/background/errors';

jest.mock('../../scripts/storage.js');

window.browser = browser;

const testAuthFetchOptions = (options) => {
    expect(options.method).toBe('POST');
    expect(options.headers).toHaveProperty('Authorization');
    const [type, credentials] = options.headers.Authorization.split(' ');
    expect(type).toBe('Basic');
    expect(atob(credentials)).toBe(`${config.clientId}:${config.clientSecret}`);
};

const queryStrToObj = (query) =>
    query.split('&').reduce((acc, pair) => {
        const [name, value] = pair.split('=');
        return { ...acc, [name]: value };
    }, {});

function testUrl(parsedUrl) {
    expect(parsedUrl.origin).toBe('https://www.reddit.com');
    expect(parsedUrl.pathname).toBe('/api/v1/authorize');
    expect(parsedUrl.searchParams.get('response_type')).toBe('code');
    expect(parsedUrl.searchParams.get('redirect_uri')).toBe(config.redirectUri);
    expect(parsedUrl.searchParams.get('client_id')).toBe(config.clientId);
    expect(parsedUrl.searchParams.get('scope')).toBe(`${scopes.read.id} ${scopes.privatemessages.id}`);
    expect(parsedUrl.searchParams.get('state')).toBe(auth.authState);
    expect(parsedUrl.searchParams.get('duration')).toBe('permanent');
}

const fakeCode = 'fakecode';
const authSuccessBody = {
    access_token: 'fakeToken',
    refresh_token: 'fakeRefreshToken',
    expires_in: new Date(Date.now() + 3600),
};

global.fetch = jest.fn(async (url, options) => {
    expect(url).toBe('https://www.reddit.com/api/v1/access_token');
    testAuthFetchOptions(options);
    const body = queryStrToObj(options.body);
    expect(body.grant_type).toBe('authorization_code');
    expect(body.code).toBe(fakeCode);

    const response = { status: 200, json: async () => authSuccessBody };
    return response;
});

browser.identity.launchWebAuthFlow.callsFake(async (details) => {
    const { url, interactive } = details;
    expect(interactive).toBeTruthy();

    const parsedUrl = new URL(url);
    testUrl(parsedUrl);
    const redirectUri = `${config.redirectUri}?code=${fakeCode}&state=${auth.authState}`;
    return redirectUri;
});

/*
describe('setAuth', () => {
    test('should return Promise and save it', async (done) => {
        expect(auth.authPromiseResolveFn).toBeNull();
        auth.setAuth().then(() => done());
        expect(auth.authPromiseResolveFn).toBeInstanceOf(Function);
        auth.login();
    });
}); */

describe('Token Retrieval', () => {
    test('should retrieve tokens and save them to storage', async () => {
        await auth.login();
        expect(storage.saveAuthData).toHaveBeenCalledWith(authSuccessBody);
    });

    test('should throw AuthError when retrieving tokens', async () => {
        const error = 'invalid_grant';
        global.fetch = jest.fn(async () => ({
            status: 200,
            json: async () => ({ error }),
        }));
        await expect(auth.login()).rejects.toThrowError(AuthError);

        global.fetch = jest.fn(async () => ({
            status: 404,
            json: async () => ({}),
        }));
        await expect(auth.login()).rejects.toThrowError(AuthError);
    });

    test('should throw AuthError when retrieving code', async () => {
        const error = 'access_denied';
        browser.identity.launchWebAuthFlow.callsFake(async () => {
            const redirectUri = `${config.redirectUri}?error=${error}&state=${auth.authState}`;
            return redirectUri;
        });
        await expect(auth.login()).rejects.toThrowError(AuthError);

        browser.identity.launchWebAuthFlow.callsFake(async () => {
            const redirectUri = `${config.redirectUri}?state=${auth.authState}`;
            return redirectUri;
        });
        await expect(auth.login()).rejects.toThrowError(AuthError);
    });
});

describe('Token Refreshing', () => {
    const refreshToken = 'refreshToken';

    test('should refresh token and save', async () => {
        const refreshSuccessBody = { access_token: 'newToken' };

        global.fetch = jest.fn(async (url, options) => {
            const parsedUrl = new URL(url);
            expect(parsedUrl.origin).toBe('https://www.reddit.com');
            expect(parsedUrl.pathname).toBe('/api/v1/access_token');
            testAuthFetchOptions(options);
            const body = queryStrToObj(options.body);
            expect(body.grant_type).toBe('refresh_token');
            expect(body.refresh_token).toBe(refreshToken);
            return {
                status: 200,
                json: async () => refreshSuccessBody,
            };
        });

        const token = await auth.renewAccessToken(refreshToken);
        expect(storage.saveAuthData).toHaveBeenCalledWith(refreshSuccessBody);
        expect(token).toBe(refreshSuccessBody.access_token);
    });

    test('should throw AuthError if error happend during refreshing', async () => {
        global.fetch = jest.fn(async () => ({
            status: 400,
        }));
        try {
            await auth.renewAccessToken();
        } catch (e) {
            expect(e).toBeInstanceOf(AuthError);
        }
    });
});

describe('getAccessToken', () => {
    // let setAuth;
    let renewAccessToken;
    const renewedToken = 'renewedToken';
    const authData = {
        accessToken: 'oldAccessToken',
        refreshToken: 'refreshToken',
    };

    beforeAll(() => {
        // setAuth = jest.spyOn(auth, 'setAuth').mockImplementation(async () => renewedToken);
        renewAccessToken = jest.spyOn(auth, 'renewAccessToken').mockImplementation(async () => renewedToken);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        // setAuth.mockRestore();
        renewAccessToken.mockRestore();
    });

    test('should return old access token', async () => {
        storage.getAuthData = jest.fn(async () => ({
            ...authData,
            expiresIn: new Date().getTime() + 1000 * 3600,
        }));
        const token = await auth.getAccessToken();
        expect(storage.getAuthData).toHaveBeenCalled();
        expect(token).toBe(authData.accessToken);
    });

    test('should return renewed accessToken', async () => {
        storage.getAuthData = jest.fn(async () => ({
            ...authData,
            expiresIn: new Date().getTime(),
        }));

        const token = await auth.getAccessToken();
        expect(storage.getAuthData).toHaveBeenCalled();
        expect(auth.renewAccessToken).toHaveBeenCalledWith(authData.refreshToken);
        expect(token).toBe(renewedToken);
    });

    test('should return renewed accessToken if there is no token in storage', async () => {
        const refreshToken = '___refreshToken___';
        storage.getAuthData = jest.fn(async () => ({
            expiresIn: new Date().getTime() + 1000 * 3600,
            refreshToken,
        }));

        const token = await auth.getAccessToken();
        expect(storage.getAuthData).toHaveBeenCalled();
        // expect(auth.setAuth).toHaveBeenCalledWith();
        expect(auth.renewAccessToken).toHaveBeenCalledWith(refreshToken);
        expect(token).toBe(renewedToken);
    });
});
