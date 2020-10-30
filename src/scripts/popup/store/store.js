import { writable } from 'svelte/store';
import nprogress from 'nprogress';
import { connect } from '../connect';
import types from '../../types';

const defaultState = {
    isLoading: false,
};

export const state = writable(defaultState, () => {
    const port = connect();
    port.onMessage.addListener(async (message) => {
        const { type /* payload */ } = message;
        switch (type) {
            // TODO: instead of messages maybe subscribe to storage's onChanged event
            // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/onChanged
            case types.NEW_POSTS:
                //
                break;
            case types.NEW_MESSAGES:
                //
                break;
            case types.UPDATING_START:
                nprogress.start();
                state.update((prev) => ({ ...prev, isLoading: true }));
                break;
            case types.UPDATING_END:
                nprogress.done();
                state.update((prev) => ({ ...prev, isLoading: false }));
                break;
            default:
        }
    });
});
