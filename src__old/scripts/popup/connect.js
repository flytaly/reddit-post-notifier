export let port = null;

export function connect() {
    if (!port) {
        port = browser.runtime.connect();
    }
    return port;
}

export function disconnect() {
    port.disconnect();
}

export function postMessage(message) {
    port.postMessage(message);
}
