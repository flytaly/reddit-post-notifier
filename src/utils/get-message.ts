import { browser } from 'webextension-polyfill-ts';
import type messages from '../../extension/_locales/en/messages.json';

type LocaleMessage = keyof typeof messages;

const getMsg = (msg: LocaleMessage): string => browser.i18n.getMessage(msg);

export default getMsg;
