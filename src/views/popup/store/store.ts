import nProgress from 'nprogress';
import { readable, writable } from 'svelte/store';
import type { Storage } from 'webextension-polyfill-ts';
import { browser } from 'webextension-polyfill-ts';

import { connectToBg, disconnectFromBg, onMessage } from '@/port';
import storage from '@/storage';
import { dataFields } from '@/storage/fields';
import type { StorageFields } from '@/storage/storage-types';

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
    return () => {
        disconnectFromBg();
    };
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
});
