import { browser } from 'webextension-polyfill-ts';
import { IS_FIREFOX, IS_TEST } from '../constants';

if (IS_FIREFOX) {
    // Support notification-sound extension
    // https://github.com/freaktechnik/notification-sounds#extension-integration
    browser.notifications.onShown?.addListener(() => {
        void browser.runtime.sendMessage('@notification-sound', 'new-notification');
    });
}

export function startExtension(): void {
    void browser.browserAction.setBadgeBackgroundColor({ color: 'darkred' });
}

if (!IS_TEST) startExtension();
