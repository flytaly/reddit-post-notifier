import browser from 'webextension-polyfill';
import type { PortMessage, PortMessageId, PortMessagePayload } from './types/message';

export type MessageListener = (payload?: PortMessagePayload) => Promise<void> | void;
type Context = 'popup' | 'options' | 'background';

const messageListeners = new Map<PortMessageId, MessageListener>();

export function sendMessage(id: PortMessageId, payload?: PortMessagePayload) {
    const message: PortMessage = { id, payload };
    return chrome.runtime.sendMessage(message);
}

let listener: Parameters<typeof browser.runtime.onMessage.addListener>[0];

export function listenForMessages(context: Context) {
    if (listener && browser.runtime.onMessage.hasListener(listener)) {
        browser.runtime.onMessage.removeListener(listener);
    }
    listener = function (request /* , sender, sendResponse */) {
        const message = request as PortMessage;
        console.info(`${context} received message`, message);
        void messageListeners.get(message.id)?.(message.payload);
    };
    browser.runtime.onMessage.addListener(listener);
}

export function onMessage(id: PortMessageId, cb: MessageListener) {
    messageListeners.set(id, cb);
}
