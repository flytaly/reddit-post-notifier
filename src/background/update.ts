import NotifierApp from '../notifier/app';
import { sendMessage } from '../messaging';
import storage from '../storage';
import { scheduleNextUpdate } from './timers';
import { isAuthError } from '@/reddit-api/errors';

/* eslint-disable-next-line import/no-mutable-exports */
export let isUpdating = false;

export async function updateAndSchedule(isForcedByUser = false) {
    if (isUpdating)
        return;
    isUpdating = true;
    void sendMessage('UPDATING_START');

    try {
        const app = new NotifierApp((rl) => {
            if (rl.reset)
                void sendMessage('RATE_LIMITS', rl);
        });
        await app.update(isForcedByUser);
        await scheduleNextUpdate();
    }
    catch (e) {
        console.error(e);
        if (isAuthError(e)) {
            await storage.setAuthError(e);
            isUpdating = false;
            if (e.invalidateToken)
                await updateAndSchedule();
            return;
        }
    }
    finally {
        isUpdating = false;
        void sendMessage('UPDATING_END');
    }
    scheduleNextUpdate();
}
