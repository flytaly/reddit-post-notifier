import { browser, type Events } from 'webextension-polyfill-ts';
import type { Runtime } from 'webextension-polyfill-ts';
import { IS_DEV, IS_FIREFOX, IS_TEST } from '../constants';
import DEFAULT_OPTIONS from '../options-default';
import { initializeBgListener, onMessage } from '../port';
import storage from '../storage';
import type { PortMessage } from '../types/message';
import { addNotificationClickListener } from '../notifier/notifications';
import { scheduleNextUpdate, watchAlarms } from './timers';
import { isUpdating, updateAndSchedule } from './update';
import type { ExtensionOptions } from '@/types/extension-options';
import { setPopup } from '@/utils/set-popup';
import { functions } from 'lodash';

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
    };
    browser.runtime.onInstalled.addListener(listener);
}

export async function startExtension() {
    await onInstall();

    void browser.browserAction.setBadgeBackgroundColor({ color: 'darkred' });

    // Storage
    const options = await mergeOptions();

    await setPopup(options.onBadgeClick == 'openall');

    browser.storage.onChanged.addListener(() => void storage.countNumberOfUnreadItems());
    void storage.countNumberOfUnreadItems();

    // Register notifications
    addNotificationClickListener();

    // Register alarms
    watchAlarms();

    // Register port
    initializeBgListener((p) => {
        if (isUpdating) p.postMessage({ id: 'UPDATING_START' } as PortMessage);
    });

    onMessage('UPDATE_NOW', () => updateAndSchedule(true));
    onMessage('SCHEDULE_NEXT_UPDATE', () => scheduleNextUpdate());

    await updateAndSchedule();
}

if (!IS_TEST) void startExtension();

if (IS_DEV) void browser.tabs.create({ url: browser.runtime.getURL('dist/options/watch.html') });
