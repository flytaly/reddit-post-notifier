import auth from './auth';
import storage from '../storage';


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

window.requestIdleCallback(async () => {
    const { accessToken } = await storage.getAuthData();

    if (!accessToken) {
        await auth.setAuth();
    }

    await update();
});
