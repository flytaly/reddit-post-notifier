/* eslint-disable @typescript-eslint/unbound-method */
import fetchMock from 'jest-fetch-mock';
import auth from './auth';
import scopes from './scopes';
import storage from '../storage';
import { AuthError } from './errors';
import { config } from '../constants';

jest.mock('../storage/index.ts');

const testAuthFetchOptions = (options: RequestInit) => {
    expect(options.method).toBe('POST');
    expect(options.headers).toHaveProperty('Authorization');
    const [type, credentials] = options.headers['Authorization'].split(' ');
    expect(type).toBe('Basic');
    expect(Buffer.from(credentials, 'base64').toString()).toBe(`${config.clientId}:${config.clientSecret}`);
};

const queryStrToObj = (query: string): Record<string, string> =>
    query.split('&').reduce((acc, pair) => {
        const [name, value] = pair.split('=');
        return { ...acc, [name]: value };
    }, {});

function testUrl(url: string) {
    const parse = new URL(url);
    const params = Object.fromEntries(parse.searchParams.entries());
    expect(parse.origin).toBe('https://www.reddit.com');
    expect(parse.pathname).toBe('/api/v1/authorize');
    expect(params).toMatchObject({
        response_type: 'code',
        redirect_uri: config.redirectUri,
        client_id: config.clientId,
        scope: `${scopes.read.id} ${scopes.privatemessages.id} ${scopes.history.id}`,
        state: auth.authState,
        duration: 'permanent',
    });
}

const fakeCode = 'fakecode';
const authSuccessBody = {
    access_token: 'fakeToken',
    refresh_token: 'fakeRefreshToken',
    expires_in: new Date(Date.now() + 3600),
};

const jsonResponse = (result: unknown, status = 200) => {
    const response = { status, json: () => new Promise((resolve) => resolve(result)) } as unknown as Response;
    return new Promise<Response>((resolve) => resolve(response));
};

describe('Token Retrieval', () => {
    function mockAuthFlow() {
        mockBrowser.identity.launchWebAuthFlow.mock(async ({ interactive, url }) => {
            expect(interactive).toBeTruthy();
            testUrl(url);
            return `${config.redirectUri}?code=${fakeCode}&state=${auth.authState}`;
        });
    }
    test('should retrieve tokens and save them to the storage', async () => {
        mockAuthFlow();
        fetchMock.mockImplementationOnce((url, options) => {
            expect(url).toBe('https://www.reddit.com/api/v1/access_token');
            testAuthFetchOptions(options);
            const body = queryStrToObj(options.body as string);
            expect(body.grant_type).toBe('authorization_code');
            expect(body.code).toBe(fakeCode);
            return jsonResponse(authSuccessBody);
        });
        await auth.login();
        expect(storage.saveAuthData).toHaveBeenCalledWith(authSuccessBody);
    });

    test('should throw AuthError when retrieving tokens', async () => {
        mockAuthFlow();
        fetchMock.mockImplementationOnce(() => jsonResponse({ error: 'invalid_grant' }));
        await expect(auth.login()).rejects.toThrowError(AuthError);

        fetchMock.mockImplementationOnce(() => jsonResponse({}, 404));
        await expect(auth.login()).rejects.toThrowError(AuthError);
    });

    test('should throw AuthError when retrieving code', async () => {
        const error = 'access_denied';
        let redirectUri = `${config.redirectUri}?error=${error}&state=${auth.authState}`;

        mockBrowser.identity.launchWebAuthFlow.mock(async () => redirectUri);
        await expect(auth.login()).rejects.toThrowError(new AuthError(error));

        redirectUri = `${config.redirectUri}?state=${auth.authState}`;
        mockBrowser.identity.launchWebAuthFlow.mock(async () => redirectUri);
        await expect(auth.login()).rejects.toThrowError(new AuthError("Couldn't get auth code"));
    });
});

describe('Token Refreshing', () => {
    const refreshToken = 'refreshToken';

    test('should refresh token and save', async () => {
        const refreshSuccessBody = { access_token: 'newToken' };

        fetchMock.mockImplementationOnce((url, options) => {
            const parsedUrl = new URL(url as string);
            expect(parsedUrl.origin).toBe('https://www.reddit.com');
            expect(parsedUrl.pathname).toBe('/api/v1/access_token');
            testAuthFetchOptions(options);
            const body = queryStrToObj(options.body.toString());
            expect(body.grant_type).toBe('refresh_token');
            expect(body.refresh_token).toBe(refreshToken);
            return jsonResponse(refreshSuccessBody);
        });

        const token = await auth.renewAccessToken(refreshToken);
        expect(storage.saveAuthData).toHaveBeenCalledWith(refreshSuccessBody);
        expect(token).toBe(refreshSuccessBody.access_token);
    });

    test('should throw AuthError if error happend during refreshing', async () => {
        fetchMock.mockImplementationOnce(() => jsonResponse({}, 400));
        await expect(() => auth.renewAccessToken('')).rejects.toThrowError(AuthError);
    });
});

describe('Get Access Token', () => {
    let renewAccessToken;
    const renewedToken = 'renewedToken';
    const authData = {
        accessToken: 'oldAccessToken',
        refreshToken: 'refreshToken',
    };

    beforeAll(() => {
        renewAccessToken = jest.spyOn(auth, 'renewAccessToken').mockImplementation(async () => renewedToken);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
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
        expect(auth.renewAccessToken).toHaveBeenCalledWith(refreshToken);
        expect(token).toBe(renewedToken);
    });
});
