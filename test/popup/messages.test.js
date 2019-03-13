import browser from './mocks/browser.mock';
import './mocks/storage.mock';
import { data } from '../../scripts/popup/data';
import nav from './mocks/navigation.mock';
import { insertNewPosts } from './mocks/render-post-list.mock';
import types from '../../scripts/types';
import subreddits from '../fixtures/subreddits';
import updateHeader from '../../scripts/popup/updateHeader';
import { connect, postMessage } from '../../scripts/popup/messages';

let listener;
jest.mock('../../scripts/popup/updateHeader', () => jest.fn());

const port = {
    onMessage: {
        addListener: jest.fn((cb) => { listener = cb; }),
    },
    postMessage: jest.fn(),
};

const mockConnect = jest.fn(() => port);

beforeAll(() => {
    browser.runtime.connect.callsFake(mockConnect);
    connect(nav);
});

describe('connect', () => {
    test('should establishes a connection to the extension process', () => {
        expect(mockConnect).toHaveBeenCalled();
    });

    test('should add message listener ', () => {
        expect(listener).toBeInstanceOf(Function);
    });

    test('should update main page after receiving new posts', async () => {
        const msg = { type: types.NEW_POSTS, payload: {} };
        nav.locations.current = nav.locations.queriesList;
        await listener(msg);
        expect(nav.navigate).toHaveBeenCalledWith(
            nav.locations.queriesList, { forceUpdate: true },
        );
    });

    test('should update page with posts after receiving new posts', async () => {
        jest.clearAllMocks();
        const msg = { type: types.NEW_POSTS, payload: {} };
        nav.locations.current = nav.locations.postList;
        await listener(msg);
        expect(nav.navigate).not.toHaveBeenCalled();
        expect(data.subrData).toEqual(subreddits);
        expect(insertNewPosts).toHaveBeenCalledWith(msg.payload);
    });

    test('should update header after receiving new messages', async () => {
        jest.clearAllMocks();
        const msg = { type: types.NEW_MESSAGES, payload: { count: 3 } };
        nav.locations.current = nav.locations.queriesList;
        await listener(msg);
        expect(nav.navigate).not.toHaveBeenCalled();
        expect(updateHeader).toHaveBeenCalledWith(nav.locations.queriesList, { unreadMsgCount: 3 });
    });
});

describe('postMessage', () => {
    test('should post message', () => {
        const msg = { type: types.NEW_POSTS, payload: {} };
        postMessage(msg);
        expect(port.postMessage).toHaveBeenCalledWith(msg);
    });
});
