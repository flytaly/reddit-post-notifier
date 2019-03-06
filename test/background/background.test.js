
import browser from './mocks/browser.mock';
import requestIdleCallback from './mocks/requestIdleCallback.mock';
import storage from '../../scripts/storage';
import auth from '../../scripts/background/auth';
import bgScripts from '../../scripts/background/background';
import optionsDefault from '../../scripts/options-default';
import types from '../../scripts/types';

jest.mock('../../scripts/background/auth.js');
jest.mock('../../scripts/background/app.js');
jest.mock('../../scripts/storage.js');

const { startExtension, connectListener } = bgScripts;

beforeAll(() => {
    storage.getOptions = jest.fn(async () => optionsDefault);
});

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

describe('popup messages listener', () => {
    let messageListener = null;
    const port = {
        onMessage: {
            addListener: jest.fn((f) => {
                messageListener = f;
            }),
        },
    };

    test('should add listener', () => {
        expect(browser.runtime.onConnect.addListener.calledOnceWith(connectListener)).toBeTruthy();
    });

    test('should call removing post from storage after receiving READ_POST', () => {
        storage.removePost = jest.fn();

        connectListener(port);
        expect(port.onMessage.addListener).toHaveBeenCalled();
        expect(messageListener).toBeInstanceOf(Function);

        const payload = { id: 'id', subreddit: 'subreddit' };
        messageListener({ type: types.READ_POST, payload });
        expect(storage.removePost).toHaveBeenCalledWith(payload);
    });
});
