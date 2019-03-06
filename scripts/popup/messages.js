import types from '../types';
import { insertNewPosts } from './renderPostList';

let port = null;

export function connect(nav) {
    if (!port) {
        port = browser.runtime.connect();
        port.onMessage.addListener(async (message) => {
            const { type, payload } = message;
            switch (type) {
                case types.NEW_POSTS:
                    if (nav.locations.current === nav.locations.queriesList) {
                        nav.navigate(nav.locations.queriesList, { forceUpdate: true });
                    }
                    if (nav.locations.current === nav.locations.postList) {
                        insertNewPosts(payload);
                    }
                    break;
                default:
            }
        });
    }
    return port;
}

export function postMessage(message) {
    port.postMessage(message);
}
