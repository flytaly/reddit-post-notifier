import { browser, Runtime } from 'webextension-polyfill-ts';
import type { PortMessage, PortMessageId, PortMessagePayload } from './types/message';

export type MessageListener = (payload?: PortMessagePayload) => Promise<void> | void;
type FromContext = 'popup' | 'options';

const portMap = new Map<string, Runtime.Port>();
const messageListeners = new Map<PortMessageId, MessageListener>();
let bgPort: Runtime.Port;

export const sendFromBg = (id: PortMessageId, payload?: PortMessagePayload, dest?: string) => {
    const message: PortMessage = { id, payload };
    if (!dest) portMap.forEach((p) => p.postMessage(message));
    else portMap.get(dest)?.postMessage(message);
};

export const connectToBg = (context: FromContext) => {
    if (bgPort) return;
    bgPort = browser.runtime.connect({ name: context });
    bgPort.onMessage.addListener((message: PortMessage) => {
        console.info(` ${context} received message`, message);
        messageListeners.get(message.id)?.(message.payload);
    });
    bgPort.onDisconnect.addListener(() => {
        bgPort = null;
    });
};

export const sendToBg = (id: PortMessageId, payload?: PortMessagePayload) => {
    const message: PortMessage = { id, payload };
    bgPort?.postMessage(message);
};

export function initializeBgListener(onConnect?: (port: Runtime.Port) => void) {
    const handler = (incoming: Runtime.Port) => {
        const portId = incoming.name;
        console.info(`${portId} connected to background`);

        onConnect?.(incoming);
        portMap.set(portId, incoming);

        incoming.onMessage.addListener((message: PortMessage) => {
            console.info(`background received message from ${portId} `, message);
            messageListeners.get(message.id)?.(message.payload);
        });

        incoming.onDisconnect.addListener(() => {
            portMap.delete(portId);
            console.info(`${portId} disconnected from background`);
        });
    };

    browser.runtime.onConnect.addListener(handler);
}

export const onMessage = (id: PortMessageId, cb: MessageListener) => {
    messageListeners.set(id, cb);
};
