import nProgress from 'nprogress';
import { readable, writable } from 'svelte/store';
import type { Storage } from 'webextension-polyfill';
import browser from 'webextension-polyfill';

import { listenForMessages, onMessage } from '@/messaging';
import storage from '@/storage';
import { dataFields } from '@/storage/fields';
import type { StorageFields } from '@/storage/storage-types';
import { IS_TEST } from '@/constants';

const defaultState = {
    ...dataFields,
    isLoaded: false,
};

export const isUpdating = readable(false, (set) => {
    listenForMessages('popup');
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
        storageData.update((prev) => ({ ...prev, ...data, isLoaded: true }));
    });

    const listener = (changes: Record<string, Storage.StorageChange>) => {
        const obj: Partial<StorageFields> = {};
        (Object.keys(changes) as Array<keyof StorageFields>) //
            .map((changeKey) => {
                // @ts-ignore
                obj[changeKey] = changes[changeKey]?.newValue;
            });
        storageData.update((prev) => ({ ...prev, ...obj }));
    };

    browser.storage.onChanged.addListener(listener);

    return () => {
        if (!IS_TEST) browser.storage.onChanged.removeListener(listener);
    };
});
