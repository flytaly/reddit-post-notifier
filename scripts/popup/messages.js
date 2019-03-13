import types from '../types';
import { insertNewPosts } from './renderPostList';
import { updateData } from './data';
import updateHeader from './updateHeader';

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
                        await updateData();
                        insertNewPosts(payload);
                    }
                    break;
                case types.NEW_MESSAGES:
                    if (nav.locations.current === nav.locations.queriesList) {
                        updateHeader(nav.locations.queriesList, { unreadMsgCount: payload.count });
                        await updateData();
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
