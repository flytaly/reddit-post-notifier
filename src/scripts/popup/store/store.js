import { writable } from 'svelte/store';
import nprogress from 'nprogress';
import { connect } from '../connect';
import types from '../../types';
import storage, { dataFields } from '../../storage';

const defaultState = {
    isLoading: false,
    ...dataFields,
};

export const state = writable(defaultState, async () => {
    // Restore data from storage
    const data = await storage.getAllData();
    state.update((prev) => ({ ...prev, ...data }));

    // Update data on changes
    browser.storage.onChanged.addListener((changes) => {
        const { subreddits, queries, queriesList, messages } = changes.newValue;
        if (subreddits) {
            state.update((prev) => ({ ...prev, subreddits: { ...prev.subreddits, ...subreddits } }));
        }
        if (queries) {
            state.update((prev) => ({ ...prev, queries: { ...prev.queries, ...queries } }));
        }
        if (messages) {
            state.update((prev) => ({ ...prev, messages: { ...prev.messages, ...messages } }));
        }
        if (queriesList) {
            state.update((prev) => ({ ...prev, queriesList: { ...prev.queriesList, ...queriesList } }));
        }
    });

    // Update data on messages
    const port = connect();
    port.onMessage.addListener(async (message) => {
        const { type /* , payload */ } = message;
        switch (type) {
            case types.NEW_POSTS:
                // TODO: remove legacy messages
                break;
            case types.NEW_MESSAGES:
                // TODO: remove legacy messages
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
