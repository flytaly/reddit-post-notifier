let port = null;

// eslint-disable-next-line import/prefer-default-export
export function connect() {
    if (!port) port = browser.runtime.connect();
    return port;
}

export function postMessage(message) {
    port.postMessage(message);
}
