import browser from 'webextension-polyfill';

import { openGroups } from './open-groups';
import { scheduleNextUpdate, watchAlarms } from './timers';
import { isUpdating, updateAndSchedule } from './update';
import { IS_CHROME, IS_DEV, IS_FIREFOX, IS_TEST } from '@/constants';
import { listenForMessages, onMessage, sendMessage } from '@/messaging';
import { addNotificationClickListener } from '@/notifier/notifications';
import DEFAULT_OPTIONS from '@/options-default';
import storage from '@/storage';
import { setIcons } from '@/utils/apply-theme';
import type { OpenGroupsPayload } from '@/types/message';

if (IS_FIREFOX) {
    // Support notification-sound extension
    // https://github.com/freaktechnik/notification-sounds#extension-integration
    browser.notifications.onShown?.addListener(() => {
        void browser.runtime.sendMessage('@notification-sound', 'new-notification');
    });
}

/** Make sure that all options fields are saved */
async function mergeOptions() {
    const options = await storage.getOptions();
    await storage.saveOptions({ ...DEFAULT_OPTIONS, ...options });
    return options;
}

async function onInstall() {
    const listener = () => {
        void mergeOptions();

        if (IS_DEV)
            void browser.tabs.create({ url: browser.runtime.getURL('dist/options/watch.html') });
    };
    browser.runtime.onInstalled.addListener(listener);
}

async function restoreIcon() {
    /** Can't use `matchMedia` here, so restore icon from the storage  */
    const { iconTheme } = await storage.getOptions();
    if (!iconTheme)
        return;
    await setIcons({ isDark: iconTheme === 'dark' });
}

async function setTheme() {
    await browser.action.setBadgeBackgroundColor({ color: 'darkred' });

    if (IS_CHROME)
        await restoreIcon();
}

let started = false;

export async function startExtension() {
    if (started)
        return;

    await onInstall();
    browser.runtime.onStartup.addListener(() => void startExtension());

    void setTheme();

    browser.storage.onChanged.addListener(() => void storage.countNumberOfUnreadItems());
    void storage.countNumberOfUnreadItems();

    // Register notifications
    addNotificationClickListener();

    // Register alarms
    watchAlarms();

    listenForMessages('background');
    onMessage('UPDATE_NOW', () => updateAndSchedule(true));
    onMessage('SCHEDULE_NEXT_UPDATE', () => scheduleNextUpdate());
    onMessage('OPEN_GROUPS', payload => openGroups(payload as OpenGroupsPayload));
    if (isUpdating)
        void sendMessage('UPDATING_START');

    await updateAndSchedule();

    /* if (IS_DEV) { */
    /*     notify({ type: NotificationId.test, message: 'Background page loaded' }, 'sound_00'); */
    /* } */

    started = true;
}

if (!IS_TEST)
    void startExtension();
