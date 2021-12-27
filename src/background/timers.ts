import { browser } from 'webextension-polyfill-ts';
import { TARGET } from '../constants';
import storage from '../storage';
import { AlarmType } from '../types/alarms';
import { updateAndSchedule } from './update';

let timeoutId: void | ReturnType<typeof setTimeout>;

export const watchAlarms = () => {
    browser.alarms.onAlarm.addListener(({ name }) => {
        if (name === AlarmType.ALARM_UPDATE) void updateAndSchedule();
    });
};

export const scheduleNextUpdate = async () => {
    const { updateInterval } = await storage.getOptions();
    const interval = Math.max(updateInterval, 2);

    timeoutId = timeoutId ? clearTimeout(timeoutId) : undefined;

    if (TARGET === 'chrome' && interval < 60) {
        // in Chrome it's impossible to set alarms with delay less than 1 minute
        timeoutId = setTimeout(() => void updateAndSchedule(), interval * 1000);
    } else {
        browser.alarms.create(AlarmType.ALARM_UPDATE, { delayInMinutes: interval / 60 });
    }
};
