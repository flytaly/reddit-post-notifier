import type { Runtime } from 'webextension-polyfill';
import browser from 'webextension-polyfill';
import { IS_DEV, IS_FIREFOX, IS_TEST } from '../constants';
import { listenForMessages, onMessage, sendMessage } from '../messaging';
import { addNotificationClickListener } from '../notifier/notifications';
import DEFAULT_OPTIONS from '../options-default';
import storage from '../storage';
import { openGroups } from './open-groups';
import { scheduleNextUpdate, watchAlarms } from './timers';
import { isUpdating, updateAndSchedule } from './update';

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
    const listener = (info: Runtime.OnInstalledDetailsType) => {
        if (info.reason === 'update' && parseInt(info.previousVersion || '1') < 4) {
            void storage.migrateToV4();
        }
        if (IS_DEV) {
            void browser.tabs.create({ url: browser.runtime.getURL('dist/options/watch.html') });
        }
    };
    browser.runtime.onInstalled.addListener(listener);
}

let started = false;

export async function startExtension() {
    if (started) return;

    await onInstall();
    browser.runtime.onStartup.addListener(() => void startExtension());

    void browser.action.setBadgeBackgroundColor({ color: 'darkred' });

    // Storage
    await mergeOptions();

    browser.storage.onChanged.addListener(() => void storage.countNumberOfUnreadItems());
    void storage.countNumberOfUnreadItems();

    // Register notifications
    addNotificationClickListener();

    // Register alarms
    watchAlarms();

    listenForMessages('background');
    onMessage('UPDATE_NOW', () => updateAndSchedule(true));
    onMessage('SCHEDULE_NEXT_UPDATE', () => scheduleNextUpdate());
    onMessage('OPEN_GROUPS', openGroups);
    if (isUpdating) void sendMessage('UPDATING_START');

    await updateAndSchedule();

    /* if (IS_DEV) { */
    /*     notify({ type: NotificationId.test, message: 'Background page loaded' }, 'sound_00'); */
    /* } */

    started = true;
}

if (!IS_TEST) void startExtension();
