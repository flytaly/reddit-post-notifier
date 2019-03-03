import browser from 'sinon-chrome/webextensions';
import storage from '../scripts/storage';

window.browser = browser;

describe('authorization data', () => {
    const RealDate = Date;
    function mockDate(isoDate) {
        global.Date = class extends RealDate {
            constructor() {
                return new RealDate(isoDate);
            }
        };
    }
    afterEach(() => {
        global.Date = RealDate;
    });

    const accessToken = 'accessToken';
    const refreshToken = 'refreshToken';
    const expiresIn = 3600;

    test('should save authorization data', async () => {
        const authDataSnake = {
            access_token: accessToken,
            expires_in: expiresIn,
            refresh_token: refreshToken,
            token_type: 'tokenType',
            scope: 'scope',
        };
        browser.storage.local.set.callsFake(async data => data);
        mockDate('2019-02-17T00:25:58.000Z');
        const expiresInAbsolute = new Date().getTime() + expiresIn * 1000;
        const savedData = await storage.saveAuthData(authDataSnake);
        expect(savedData).toMatchObject({
            accessToken, refreshToken, expiresIn: expiresInAbsolute,
        });
    });

    test('should give authorization data', async () => {
        await storage.getAuthData();
        const keys = ['accessToken', 'expiresIn', 'refreshToken'];
        expect(browser.storage.local.get.calledOnceWith(keys)).toBeTruthy();
    });
});

describe('options', () => {
    const options = { option1: 1, option2: 2 };
    beforeAll(() => {
        browser.storage.local.get.callsFake(async (key) => {
            expect(key).toBe('options');
            return { options };
        });
    });
    test('should return options', async () => {
        const result = await storage.getOptions();
        expect(result).toEqual(options);
    });
    test('should save options', async () => {
        const newOptions = { newOption1: 'value1', newOption2: 'value2' };
        browser.storage.local.set.callsFake(async (opts) => {
            expect(opts.options).toEqual({ ...options, ...newOptions });
            return null;
        });
        await storage.saveOptions(newOptions);
    });
});
