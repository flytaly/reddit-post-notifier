import { readable, writable } from 'svelte/store';
import storage from '../../../storage';
import type { StorageFields } from '../../../storage/storage-types';
import { connectToBg, disconnectFromBg, onMessage } from '../../../port';
import nProgress from 'nprogress';
import { dataFields } from '../../../storage/fields';
import { browser } from 'webextension-polyfill-ts';
import type { Storage } from 'webextension-polyfill-ts';
const defaultState = { ...dataFields };

export const isUpdating = readable(false, (set) => {
    connectToBg('popup');
    onMessage('UPDATING_START', () => {
        set(true);
        void nProgress.start();
    });
    onMessage('UPDATING_END', () => {
        set(false);
        void nProgress.done();
    });
});

export const storageData = writable(defaultState, () => {
    // Restore data from storage
    void storage.getAllData().then((data) => {
        storageData.update((prev) => ({ ...prev, ...data }));
    });

    const listener = (changes: { [s in keyof StorageFields]: Storage.StorageChange }) => {
        const { pinnedPostList, subredditList, subreddits, queries, queriesList, messages } = changes;
        if (pinnedPostList?.newValue) {
            storageData.update((prev) => ({ ...prev, pinnedPostList: [...pinnedPostList.newValue] }));
        }
        if (subreddits?.newValue) {
            storageData.update((prev) => ({ ...prev, subreddits: { ...subreddits.newValue } }));
        }
        if (queries?.newValue) {
            storageData.update((prev) => ({ ...prev, queries: { ...queries.newValue } }));
        }
        if (messages?.newValue) {
            storageData.update((prev) => ({ ...prev, messages: { ...messages.newValue } }));
        }
        if (queriesList?.newValue) {
            storageData.update((prev) => ({ ...prev, queriesList: [...queriesList.newValue] }));
        }
        if (subredditList?.newValue) {
            storageData.update((prev) => ({ ...prev, subredditList: [...subredditList.newValue] }));
        }
    };

    browser.storage.onChanged.addListener(listener);

    return () => {
        browser.storage.onChanged.removeListener(listener);
    };
    //     // Update data on changes

    // Update data on messages
    // const port = connect();
    // port.onMessage.addListener(async (message) => {
    //     const { type /* , payload */ } = message;
    //     switch (type) {
    //         case types.UPDATING_START:
    //             nprogress.start();
    //             state.update((prev) => ({ ...prev, isLoading: true }));
    //             break;
    //         case types.UPDATING_END:
    //             nprogress.done();
    //             state.update((prev) => ({ ...prev, isLoading: false }));
    //             break;
    //         default:
    //     }
    // });
});
