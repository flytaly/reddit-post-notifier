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
        const { pinnedPostList, subredditList, subreddits, queries, queriesList, messages } = changes;
        if (pinnedPostList?.newValue) {
            state.update((prev) => ({ ...prev, pinnedPostList: [...pinnedPostList.newValue] }));
        }
        if (subreddits?.newValue) {
            state.update((prev) => ({ ...prev, subreddits: { ...subreddits.newValue } }));
        }
        if (queries?.newValue) {
            state.update((prev) => ({ ...prev, queries: { ...queries.newValue } }));
        }
        if (messages?.newValue) {
            state.update((prev) => ({ ...prev, messages: { ...messages.newValue } }));
        }
        if (queriesList?.newValue) {
            state.update((prev) => ({ ...prev, queriesList: [...queriesList.newValue] }));
        }
        if (subredditList?.newValue) {
            state.update((prev) => ({ ...prev, subredditList: [...subredditList.newValue] }));
        }
    });

    // Update data on messages
    const port = connect();
    port.onMessage.addListener(async (message) => {
        const { type /* , payload */ } = message;
        switch (type) {
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
