/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-non-null-assertion, @typescript-eslint/unbound-method */
import type { AuthUser } from '@/storage/storage-types';
import fetchMock from 'jest-fetch-mock';
import { config } from '../constants';
import storage from '../storage';
import auth from './auth';
import { AuthError } from './errors';
import scopes from './scopes';

jest.mock('../storage/index.ts');

const testAuthFetchOptions = (options: RequestInit) => {
    expect(options.method).toBe('POST');
    expect(options.headers).toHaveProperty('Authorization');
    const [type, credentials] = options.headers?.['Authorization'].split(' ') as [string, string];
    expect(type).toBe('Basic');
    expect(Buffer.from(credentials, 'base64').toString()).toBe(`${config.clientId!}:${config.clientSecret!}`);
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
        scope: `${scopes.identity.id} ${scopes.read.id} ${scopes.privatemessages.id} ${scopes.history.id}`,
        state: auth.authState,
        duration: 'permanent',
    });
}

const fakeCode = 'fakecode';
const authSuccessBody = {
    access_token: 'fakeToken',
    refresh_token: 'fakeRefreshToken',
    expires_in: new Date(Date.now() + 3600),
    scope: 'scope',
};

const jsonResponse = (result: unknown, status = 200) => {
    const response = { status, json: () => new Promise((resolve) => resolve(result)) } as unknown as Response;
    return new Promise<Response>((resolve) => resolve(response));
};

describe('Token Retrieval', () => {
    const id = 'fake_id';
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
            testAuthFetchOptions(options!);
            const body = queryStrToObj(options!.body as string);
            expect(body.grant_type).toBe('authorization_code');
            expect(body.code).toBe(fakeCode);
            return jsonResponse(authSuccessBody);
        });
        await auth.login('fake_id');
        expect(storage.saveAuthData).toHaveBeenCalledWith({ data: authSuccessBody, id });
    });

    test('should throw AuthError when retrieving tokens', async () => {
        mockAuthFlow();
        fetchMock.mockImplementationOnce(() => jsonResponse({ error: 'invalid_grant' }));
        await expect(auth.login(id)).rejects.toThrowError(AuthError);

        fetchMock.mockImplementationOnce(() => jsonResponse({}, 404));
        await expect(auth.login(id)).rejects.toThrowError(AuthError);
    });

    test('should throw AuthError when retrieving code', async () => {
        const error = 'access_denied';
        let redirectUri = `${config.redirectUri}?error=${error}&state=${auth.authState}`;

        mockBrowser.identity.launchWebAuthFlow.mock(async () => redirectUri);
        await expect(auth.login(id)).rejects.toThrowError(new AuthError(error, id));

        redirectUri = `${config.redirectUri}?state=${auth.authState}`;
        mockBrowser.identity.launchWebAuthFlow.mock(async () => redirectUri);
        await expect(auth.login(id)).rejects.toThrowError(new AuthError("Couldn't get auth code", id));
    });
});

describe('Token Refreshing', () => {
    const id = 'fake_id';
    const refreshToken = 'refreshToken';

    test('should refresh token and save', async () => {
        const refreshSuccessBody = { access_token: 'newToken' };

        fetchMock.mockImplementationOnce((url, options) => {
            const parsedUrl = new URL(url as string);
            expect(parsedUrl.origin).toBe('https://www.reddit.com');
            expect(parsedUrl.pathname).toBe('/api/v1/access_token');
            testAuthFetchOptions(options!);
            const body = queryStrToObj(options!.body!.toString());
            expect(body.grant_type).toBe('refresh_token');
            expect(body.refresh_token).toBe(refreshToken);
            return jsonResponse(refreshSuccessBody);
        });

        const token = await auth.renewAccessToken(refreshToken, id);
        expect(storage.saveAuthData).toHaveBeenCalledWith({ data: refreshSuccessBody, id });
        expect(token).toBe(refreshSuccessBody.access_token);
    });

    test('should throw AuthError if error happens during refreshing', async () => {
        fetchMock.mockImplementationOnce(() => jsonResponse({}, 400));
        await expect(() => auth.renewAccessToken('', id)).rejects.toThrowError(AuthError);
    });
});

describe('Get Access Token', () => {
    let renewAccessToken: ReturnType<typeof jest.spyOn>;
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
        const user: AuthUser = { id: 'id1', auth: { ...authData, expiresIn: new Date().getTime() + 1000 * 3600 } };
        const token = await auth.getAccessToken(user);
        expect(auth.renewAccessToken).not.toHaveBeenCalled();
        expect(token).toBe(authData.accessToken);
    });

    test('should return renewed accessToken', async () => {
        const user: AuthUser = { id: 'id1', auth: { ...authData, expiresIn: new Date().getTime() } };
        const token = await auth.getAccessToken(user);
        expect(auth.renewAccessToken).toHaveBeenCalledWith(authData.refreshToken, 'id1');
        expect(token).toBe(renewedToken);
    });

    test('should return renewed accessToken if there is no token in the storage', async () => {
        const refreshToken = '___refreshToken___';
        const user: AuthUser = { id: 'id1', auth: { refreshToken, expiresIn: new Date().getTime() + 1000 * 3600 } };
        const token = await auth.getAccessToken(user);
        expect(auth.renewAccessToken).toHaveBeenCalledWith(refreshToken, 'id1');
        expect(token).toBe(renewedToken);
    });
});
