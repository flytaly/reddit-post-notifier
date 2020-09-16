import storage from '../storage';
import types from '../types';

let timeoutId;
let updateFunc;

export const watchAlarms = (update) => {
    updateFunc = update;
    browser.alarms.onAlarm.addListener(async ({ name }) => {
        if (name === types.ALARM_UPDATE) {
            await updateFunc();
        }
    });
};

export const scheduleNextUpdate = async () => {
    const { updateInterval } = await storage.getOptions();

    timeoutId = timeoutId ? clearTimeout(timeoutId) : undefined;

    if (TARGET === 'chrome' && updateInterval < 60) {
        // in Chrome it's impossible to set alarms with delay less than 1 minute
        timeoutId = setTimeout(() => updateFunc(), updateInterval * 1000);
    } else {
        browser.alarms.create(types.ALARM_UPDATE, { delayInMinutes: updateInterval / 60 });
    }
};
