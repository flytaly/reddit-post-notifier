import types from './types';
import './l10n';
import './popup/openLinks';

let port = null;

function connect() {
    if (!port) {
        port = browser.runtime.connect();
        port.onMessage.addListener(async (message) => {
            console.log('message', message);
        });
    }
    return port;
}

function postMessage(message) {
    port.postMessage(message);
}

connect();

document.addEventListener('DOMContentLoaded', () => {
    if (TARGET === 'firefox') {
        // show message about Firefox Multi-Account Containers
        document.body.querySelector('.firefox').hidden = false;
    }
    document.body.querySelector('button').addEventListener('click', () => {
        postMessage({ type: types.START_AUTH_FLOW });
    });
});
