import { browser } from 'webextension-polyfill-ts';
import type messages from '../../extension/_locales/en/messages.json';

type LocaleMessage = keyof typeof messages;

const getMsg = (msg: LocaleMessage, substitutions?: string | string[]): string =>
    browser.i18n.getMessage(msg, substitutions);

export default getMsg;
