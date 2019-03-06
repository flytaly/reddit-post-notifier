import auth from './auth';
import storage from '../storage';
import optionsDefault from '../options-default';
import app from './app';
import types from '../types';

async function update() {
    const { updateInterval } = await storage.getOptions();
    try {
        await app.update();
        browser.alarms.create(types.ALARM_UPDATE, { delayInMinutes: updateInterval / 60 });
    } catch (e) {
        console.error(`${e.name}: ${e.message}`);
        if (e.name === 'AuthError') {
            await auth.setAuth();
            await update();
        } else {
            browser.alarms.create(types.ALARM_UPDATE, { delayInMinutes: updateInterval / 60 });
        }
    }
}

async function setOptions() {
    const options = await storage.getOptions();
    if (!options) await storage.saveOptions(optionsDefault);
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
    port.onMessage.addListener(async (message) => {
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
            default:
        }
    });
}
browser.runtime.onConnect.addListener(connectListener);

window.requestIdleCallback(startExtension);

export default {
    update, setOptions, startExtension, connectListener,
};
