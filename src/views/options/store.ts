import { writable } from 'svelte/store';

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

export { storageData } from '@/views/popup/store/store';
// used for throttling requests from settings page
export const isBlocked = createStore();
