import { sendFromBg } from '../port';
import NotifierApp from '../notifier/app';
import { scheduleNextUpdate } from './timers';

export let isUpdating = false;

export async function updateAndSchedule(isForcedByUser = false) {
    if (isUpdating) return;
    isUpdating = true;
    sendFromBg('UPDATING_START');

    try {
        const app = new NotifierApp((rl) => {
            sendFromBg('RATE_LIMITS', rl);
        });
        await app.update(isForcedByUser);
    } catch (e) {
        console.error(e);
    } finally {
        isUpdating = false;
        sendFromBg('UPDATING_END');
        await scheduleNextUpdate();
    }
}
