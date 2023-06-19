import { browser } from 'webextension-polyfill-ts';
import { TARGET } from '../constants';
import storage from '../storage';
import { AlarmType } from '../types/alarms';
import { updateAndSchedule } from './update';

export const watchAlarms = () => {
    browser.alarms.onAlarm.addListener(({ name }) => {
        if (name === AlarmType.ALARM_UPDATE) void updateAndSchedule();
    });
};

export const scheduleNextUpdate = async () => {
    const { updateInterval } = await storage.getOptions();

    // in Chrome it's impossible to set alarms with delay less than 1 minute
    const minInterval = TARGET === 'chrome' ? 60 : 6;
    const delayInMinutes = Math.max(updateInterval, minInterval);

    browser.alarms.create(AlarmType.ALARM_UPDATE, { delayInMinutes: delayInMinutes / 60 });
};
