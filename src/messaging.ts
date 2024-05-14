/* eslint-disable no-console */
import browser from 'webextension-polyfill';
import type { PortMessage, PortMessageId, PortMessagePayload } from './types/message';

export type MessageListener = (payload?: PortMessagePayload) => Promise<void> | void;
type Context = 'popup' | 'options' | 'background';

const messageListeners = new Map<PortMessageId, MessageListener>();

export async function sendMessage(id: PortMessageId, payload?: PortMessagePayload) {
    try {
        const message: PortMessage = { id, payload };
        const response = await chrome.runtime.sendMessage(message);
        return response;
    }
    catch (error) {
        const msg = (error as Error).message;
        if (msg === 'Could not establish connection. Receiving end does not exist.') {
            console.warn(msg);
            return;
        }
        console.error(error, msg);
    }
}

let listener: Parameters<typeof browser.runtime.onMessage.addListener>[0];

export function listenForMessages(context: Context) {
    if (listener && browser.runtime.onMessage.hasListener(listener))
        browser.runtime.onMessage.removeListener(listener);

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
