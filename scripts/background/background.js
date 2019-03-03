import auth from './auth';
import storage from '../storage';
import optionsDefault from '../options-default';

async function update() {
    try {
        // todo 1: update information
        // todo 2: set update every 'x' seconds
    } catch (e) {
        console.error(`${e.name}: ${e.message}`);
        if (e.name === 'AuthError') {
            await auth.setAuth();
        }
    }
}

async function setOptions() {
    const options = await storage.getOptions();
    if (!options) await storage.saveOptions(optionsDefault);
}

async function startExtension() {
    setOptions();
    const { accessToken } = await storage.getAuthData();

    if (!accessToken) {
        await auth.setAuth();
    }

    await update();
}

window.requestIdleCallback(startExtension);

export default {
    update, setOptions, startExtension,
};
