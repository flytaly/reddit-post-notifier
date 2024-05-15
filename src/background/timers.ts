import browser from 'webextension-polyfill';
import { TARGET } from '../constants';
import storage from '../storage';
import { AlarmType } from '../types/alarms';
import { updateAndSchedule } from './update';

export function watchAlarms() {
    browser.alarms.onAlarm.addListener(({ name }) => {
        if (name === AlarmType.ALARM_UPDATE)
            void updateAndSchedule();
    });
}

export async function scheduleNextUpdate() {
    const { updateInterval } = await storage.getOptions();

    // in Chrome it's impossible to set alarms with delay less than 30 seconds (Chrome v120+)
    const minInterval = TARGET === 'chrome' ? 30 : 10;
    const delayInMinutes = Math.max(updateInterval, minInterval);

    browser.alarms.create(AlarmType.ALARM_UPDATE, { delayInMinutes: delayInMinutes / 60 });
}
