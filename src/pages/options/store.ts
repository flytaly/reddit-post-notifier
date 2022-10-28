import { connectToBg, disconnectFromBg, onMessage } from '@/port';
import nProgress from 'nprogress';
import { writable, readable } from 'svelte/store';

export const isUpdating = readable(false, (set) => {
    connectToBg('options');
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

function createStore() {
    const { subscribe, set } = writable(false);

    return {
        subscribe,
        block: () => {
            set(true);
            setTimeout(() => {
                set(false);
            }, 2000);
        },
    };
}

export { storageData } from '@/pages/popup/store/store';
// used for throttling requests from settings page
export const isBlocked = createStore();
