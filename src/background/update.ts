import { scheduleNextUpdate } from './timers';
import { sendMessage } from '@/messaging';
import NotifierApp from '@/notifier/app';
import { isAuthError } from '@/reddit-api/errors';
import storage from '@/storage';

export let isUpdating = false;

export async function updateData(isForcedByUser = false, isRecurring = false) {
    if (isUpdating)
        return;

    isUpdating = true;
    void sendMessage('UPDATING_START');

    let shouldReupdate = false;

    try {
        const app = new NotifierApp((rl) => {
            if (rl.reset)
                void sendMessage('RATE_LIMITS', rl);
        });
        await app.update(isForcedByUser);
    }
    catch (e) {
        console.error(e);
        if (isAuthError(e)) {
            await storage.setAuthError(e);
            if (e.invalidateToken)
                shouldReupdate = true;
        }
    }

    isUpdating = false;
    void sendMessage('UPDATING_END');

    if (shouldReupdate && !isRecurring)
        return updateData(isForcedByUser, true);
}

export async function updateAndSchedule(isForcedByUser = false) {
    await updateData(isForcedByUser);
    await scheduleNextUpdate();
}
