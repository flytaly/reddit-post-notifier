
import browser from './mocks/browser.mock';
import requestIdleCallback from './mocks/requestIdleCallback.mock';
import storage from '../../scripts/storage';
import auth from '../../scripts/background/auth';
import app from '../../scripts/background/app';
import bgScripts from '../../scripts/background/background';
import optionsDefault from '../../scripts/options-default';
import types from '../../scripts/types';
import popupPort from '../../scripts/background/popupPort';

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
    test('should save default options if there are no options in storage', async () => {
        storage.getOptions.mockImplementationOnce(async () => null);
        await startExtension();
        expect(storage.saveOptions).toHaveBeenCalledWith(optionsDefault);
    });

    test('should add and save new default options to existing', async () => {
        const opts = { option: 'value' };
        storage.getOptions.mockImplementationOnce(async () => (opts));
        await startExtension();
        expect(storage.saveOptions).toHaveBeenCalledWith({ ...optionsDefault, ...opts });
    });
});

describe('popup messages listener', () => {
    let messageListener = null;
    let onDisconnectListener = null;
    const port = {
        onMessage: {
            addListener: jest.fn((f) => {
                messageListener = f;
            }),
        },
        onDisconnect: {
            addListener: jest.fn((f) => {
                onDisconnectListener = f;
            }),
        },
    };

    test('should add listener', () => {
        expect(browser.runtime.onConnect.addListener.calledOnceWith(connectListener)).toBeTruthy();
    });

    test('should add message listener', () => {
        connectListener(port);

        expect(port.onMessage.addListener).toHaveBeenCalled();
        expect(messageListener).toBeInstanceOf(Function);
        expect(port.onDisconnect.addListener).toHaveBeenCalled();
        expect(onDisconnectListener).toBeInstanceOf(Function);
        expect(popupPort.port).toBe(port);
    });

    test('should set port as null after disconnect', () => {
        expect(popupPort.port).toBe(port);
        onDisconnectListener();
        expect(popupPort.port).toBe(null);
    });


    test('should call removing post from storage after receiving READ_POST', () => {
        storage.removePost = jest.fn();
        const payload = { id: 'id', subreddit: 'subreddit' };
        messageListener({ type: types.READ_POST, payload });
        expect(storage.removePost).toHaveBeenCalledWith(payload);
    });

    test('should call removing posts from subreddit after receiving READ_POSTS', () => {
        storage.removePostsFrom = jest.fn();
        const payload = { subreddit: 'subreddit' };
        messageListener({ type: types.READ_POSTS, payload });
        expect(storage.removePostsFrom).toHaveBeenCalledWith(payload);
    });

    test('should call removing all posts after receiving READ_ALL', () => {
        storage.removeAllPosts = jest.fn();
        messageListener({ type: types.READ_ALL });
        expect(storage.removeAllPosts).toHaveBeenCalled();
    });
});

describe('alarms', () => {
    beforeAll(() => {
        window.setTimeout = jest.fn();
        storage.getOptions.mockImplementation(() => ({
            updateInterval: 30,
        }));
    });
    beforeEach(() => {
        storage.getAuthData.mockImplementationOnce(() => ({ accessToken: 'validToken' }));
        browser.alarms.onAlarm.addListener.resetHistory();
        browser.alarms.create.resetHistory();
    });
    afterAll(() => { window.TARGET = 'firefox'; });

    test('should set alarm listener', async () => {
        await startExtension();
        expect(browser.alarms.onAlarm.addListener.calledOnce).toBeTruthy();

        const cb = browser.alarms.onAlarm.addListener.args[0][0];
        app.update.mockClear();
        await cb({ name: types.ALARM_UPDATE });
        expect(app.update).toHaveBeenCalledTimes(1);
    });

    test('should set alarm in FF', async () => {
        await startExtension();
        expect(browser.alarms.create.calledOnce).toBeTruthy();
        expect(browser.alarms.create.args[0][0]).toBe(types.ALARM_UPDATE);
        expect(browser.alarms.create.args[0][1]).toMatchObject({
            delayInMinutes: 30 / 60,
        });
    });
    test('should set setTimeout in Chrome if delay < 60 sec', async () => {
        window.TARGET = 'chrome';
        await startExtension();
        expect(browser.alarms.create.called).toBeFalsy();
        expect(setTimeout).toHaveBeenCalled();
        expect(setTimeout.mock.calls[0][1]).toBe(30 * 1000);
    });
    test('should set alarm in Chrome if delay >= 60 sec', async () => {
        storage.getOptions.mockImplementation(() => ({
            updateInterval: 60,
        }));
        window.TARGET = 'chrome';
        await startExtension();
        expect(browser.alarms.create.called).toBeTruthy();
        expect(browser.alarms.create.args[0][1]).toMatchObject({
            delayInMinutes: 1,
        });
    });
});
