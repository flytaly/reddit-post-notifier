import browser from 'sinon-chrome/webextensions';
import requestIdleCallback from './mocks/requestIdleCallback.mock';
import storage from '../scripts/storage';
import auth from '../scripts/background/auth';
import bgScripts from '../scripts/background/background';
import optionsDefault from '../scripts/options-default';

jest.mock('../scripts/background/auth.js');
jest.mock('../scripts/storage.js');

window.browser = browser;

const { startExtension } = bgScripts;

afterEach(() => { jest.clearAllMocks(); });

describe('background script', () => {
    test('should pass entry function into requestIdleCallback', async () => {
        expect(requestIdleCallback).toHaveBeenCalled();
        expect(requestIdleCallback).toHaveBeenCalledWith(startExtension);
    });

    test('should call setAuth if there is no accessToken in the storage', async () => {
        storage.getAuthData.mockImplementationOnce(() => ({ }));
        await startExtension();
        expect(auth.setAuth).toHaveBeenCalled();
    });

    test('should not call setAuth if there is an accessToken in the storage', async () => {
        storage.getAuthData.mockImplementationOnce(() => ({ accessToken: 'validToken' }));
        await startExtension();
        expect(auth.setAuth).not.toHaveBeenCalled();
    });
});

describe('set options', () => {
    beforeEach(() => {
        storage.getAuthData.mockImplementationOnce(() => ({ accessToken: 'validToken' }));
    });
    test('should save default options if there is no options in storage', async () => {
        storage.getOptions.mockImplementationOnce(async () => null);
        await startExtension();
        expect(storage.saveOptions).toHaveBeenCalledWith(optionsDefault);
    });

    test('should not call saving options if storage already have them', async () => {
        storage.getOptions.mockImplementationOnce(async () => ({ option: 'value' }));
        await startExtension();
        expect(storage.saveOptions).not.toHaveBeenCalled();
    });
});
