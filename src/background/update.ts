import { sendFromBg } from '../port';
import storage from '../storage';
import NotifierApp from '../notifier/app';
import { scheduleNextUpdate } from './timers';

export let isUpdating = false;

export async function updateAndSchedule(isForcedByUser = false) {
    if (isUpdating) return;
    isUpdating = true;
    sendFromBg('UPDATING_START');

    try {
        const app = new NotifierApp();
        await app.update(isForcedByUser);
        await scheduleNextUpdate();
    } catch (e) {
        console.error(e);

        if (e.name === 'AuthError') {
            // If authorization fails remove authorization data from storage and update again.
            await storage.clearAuthData();
            isUpdating = false;
            await updateAndSchedule();
        } else {
            await scheduleNextUpdate();
        }
    } finally {
        isUpdating = false;
        sendFromBg('UPDATING_END');
    }
}
