import auth from './auth';
import storage from '../storage';

export async function update() {
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

export async function startExtension() {
    const { accessToken } = await storage.getAuthData();

    if (!accessToken) {
        await auth.setAuth();
    }

    await update();
}

window.requestIdleCallback(startExtension);
