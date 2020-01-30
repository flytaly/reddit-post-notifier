import auth from './auth';
import storage from '../storage';
import optionsDefault from '../options-default';
import app from './app';
import types from '../types';
import popupPort from './popupPort';


// Support notification-sound extension
// https://github.com/freaktechnik/notification-sounds#extension-integration
if (browser.notifications.onShown) {
    browser.notifications.onShown.addListener(() => {
        browser.runtime.sendMessage('@notification-sound', 'new-notification');
    });
}

let updating = false;

async function update() {
    if (updating) return;
    updating = true;

    const { updateInterval } = await storage.getOptions();

    const countItems = await storage.countNumberOfUnreadItems();
    browser.browserAction.setBadgeText({ text: countItems ? String(countItems) : '' });

    try {
        await app.update();
        browser.alarms.create(types.ALARM_UPDATE, { delayInMinutes: updateInterval / 60 });
    } catch (e) {
        console.error(e);
        if (e.name === 'AuthError') {
            await auth.setAuth();
            updating = false;
            await update();
        } else {
            browser.alarms.create(types.ALARM_UPDATE, { delayInMinutes: updateInterval / 60 });
        }
    } finally {
        updating = false;
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

function watchAlarms() {
    browser.alarms.onAlarm.addListener(async ({ name }) => {
        if (name === types.ALARM_UPDATE) {
            await update();
        }
    });
}

async function startExtension() {
    setOptions();
    watchAlarms();

    const { accessToken } = await storage.getAuthData();

    if (!accessToken) {
        await auth.setAuth();
    }

    await update();
}

function connectListener(port) {
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
} else { // firefox
    window.requestIdleCallback(startExtension);
}

export default {
    update, setOptions, startExtension, connectListener,
};
