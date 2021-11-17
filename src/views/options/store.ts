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

// used for throttling requests from settings page
export const isBlocked = createStore();
