import { isAuthError } from '@/reddit-api/errors';
import NotifierApp from '../notifier/app';
import { sendFromBg } from '../port';
import storage from '../storage';
import { scheduleNextUpdate } from './timers';

export let isUpdating = false;

export async function updateAndSchedule(isForcedByUser = false) {
    if (isUpdating) return;
    isUpdating = true;
    sendFromBg('UPDATING_START');

    try {
        const app = new NotifierApp((rl) => {
            if (rl.reset) sendFromBg('RATE_LIMITS', rl);
        });
        await app.update(isForcedByUser);
        await scheduleNextUpdate();
    } catch (e) {
        console.error(e);
        if (isAuthError(e)) {
            await storage.setAuthError(e);
            isUpdating = false;
            if (e.invalidateToken) await updateAndSchedule();
        } else {
            await scheduleNextUpdate();
        }
    } finally {
        isUpdating = false;
        sendFromBg('UPDATING_END');
    }
}
