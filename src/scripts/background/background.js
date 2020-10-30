import auth from './auth';
import storage from '../storage';
import optionsDefault from '../options-default';
import app from './app';
import types from '../types';
import popupPort from './popupPort';
import { watchAlarms, scheduleNextUpdate } from './timer';
import applyTheme from '../theme';

if (TARGET === 'firefox' && browser.notifications.onShown) {
    // Support notification-sound extension
    // https://github.com/freaktechnik/notification-sounds#extension-integration
    browser.notifications.onShown.addListener(() => {
        browser.runtime.sendMessage('@notification-sound', 'new-notification');
    });
}

let updating = false;

async function update() {
    if (updating) return;
    updating = true;
    popupPort.postMessage({ type: types.UPDATING_START });

    const countItems = await storage.countNumberOfUnreadItems();
    browser.browserAction.setBadgeText({ text: countItems ? String(countItems) : '' });
    try {
        await app.update();
        await scheduleNextUpdate();
    } catch (e) {
        console.error(e);

        if (e.name === 'AuthError') {
            // If authorization fails remove authorization data from storage and update again.
            await storage.clearAuthData();
            updating = false;
            await update();
        } else {
            await scheduleNextUpdate();
        }
    } finally {
        updating = false;
        popupPort.postMessage({ type: types.UPDATING_END });
    }
}

async function setOptions() {
    const options = await storage.getOptions();
    if (!options) {
        await storage.saveOptions(optionsDefault);
    } else {
        await storage.saveOptions({ ...optionsDefault, ...options });
    }
}

async function startExtension() {
    await setOptions();
    browser.browserAction.setBadgeBackgroundColor({ color: 'darkred' });

    if (TARGET === 'chrome') {
        /*
            Change icon theme in Chrome after extension's launch.
            Unfortunately, chrome doesn't support 'theme_icons' in manifest.
            Also media query event listener doesn't work in the background page,
            so user still need to launch popup to change icon dynamically.
        */
        applyTheme();
    }

    watchAlarms(update);

    /* const { accessToken } = await storage.getAuthData();
    if (!accessToken) {
        await auth.setAuth();
    } */

    await update();
}

function connectListener(port) {
    if (updating) {
        port.postMessage({ type: types.UPDATING_START });
    }
    popupPort.port = port;
    popupPort.port.onMessage.addListener(async (message) => {
        const { type, payload } = message;
        switch (type) {
            case types.READ_POST: {
                await storage.removePost(payload);
                break;
            }
            case types.READ_POSTS: {
                await storage.removePostsFrom(payload);
                break;
            }
            case types.READ_ALL: {
                await storage.removeAllPosts();
                break;
            }
            case types.RESET: {
                await storage.clearStorage();
                await setOptions();
                update();
                break;
            }
            case types.UPDATE_NOW: {
                update();
                break;
            }
            case types.START_AUTH_FLOW: {
                await auth.login();
                break;
            }
            case types.SCHEDULE_NEXT_UPDATE: {
                await scheduleNextUpdate();
                break;
            }
            default:
        }
    });
    popupPort.port.onDisconnect.addListener(() => {
        popupPort.port = null;
    });
}
browser.runtime.onConnect.addListener(connectListener);

// requestIdleCallback doesn't work in Chrome
if (TARGET === 'chrome') {
    startExtension();
} else {
    // firefox
    window.requestIdleCallback(startExtension);
}

export default {
    update,
    setOptions,
    startExtension,
    connectListener,
};
