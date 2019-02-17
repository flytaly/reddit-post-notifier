import browser from 'sinon-chrome/webextensions';
import requestIdleCallback from './mocks/requestIdleCallback.mock';
import storage from '../scripts/storage';
import auth from '../scripts/background/auth';
import { startExtension } from '../scripts/background/background';

jest.mock('../scripts/background/auth.js');
jest.mock('../scripts/storage.js');

window.browser = browser;

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
