import browser from 'webextension-polyfill';
import type messages from '../../extension/_locales/en/messages.json';

type LocaleMessage = keyof typeof messages;

function getMsg(msg: LocaleMessage, substitutions?: string | string[]): string {
    return browser.i18n.getMessage(msg, substitutions);
}

export default getMsg;
