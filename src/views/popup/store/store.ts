import nProgress from 'nprogress';
import { readable, writable } from 'svelte/store';
import type { Storage } from 'webextension-polyfill-ts';
import { browser } from 'webextension-polyfill-ts';

import { connectToBg, disconnectFromBg, onMessage } from '@/port';
import storage from '@/storage';
import { dataFields } from '@/storage/fields';
import type { StorageFields } from '@/storage/storage-types';

const defaultState = {
    ...dataFields,
    isLoaded: false,
};

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
        storageData.update((prev) => ({ ...prev, ...data, isLoaded: true }));
    });

    const listener = (changes: { [s in keyof StorageFields]: Storage.StorageChange }) => {
        const obj: Partial<StorageFields> = {};
        Object.keys(changes).map((changeKey: keyof StorageFields) => {
            // @ts-ignore
            obj[changeKey] = changes[changeKey]?.newValue;
        });
        storageData.update((prev) => ({ ...prev, ...obj }));
    };
    browser.storage.onChanged.addListener(listener);

    return () => {
        browser.storage.onChanged.removeListener(listener);
    };
});
