import { browser } from 'webextension-polyfill-ts';
import { IS_FIREFOX, IS_TEST } from '../constants';
import DEFAULT_OPTIONS from '../options-default';
import storage from '../storage';

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
}

export async function startExtension() {
    await mergeOptions();
    void browser.browserAction.setBadgeBackgroundColor({ color: 'darkred' });
}

if (!IS_TEST) void startExtension();
