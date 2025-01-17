import nProgress from 'nprogress';
import { derived, writable } from 'svelte/store';
import { IS_TEST } from '@/constants';
import { listenForMessages, onMessage } from '@/messaging';
import type { RateLimits } from '@/reddit-api/client';
import { session } from '@/storage/storage';

function createMessageStore() {
    const { subscribe, update, set } = writable(
        {
            isUpdating: false,
            rateLimits: { used: null, reset: null, remaining: null } as RateLimits,
        },
        () => {
            listenForMessages('options');
        },
    );

    if (!IS_TEST) {
        void session.getRateLimits().then((rateLimits) => {
            if (Date.now() > (rateLimits.reset || 0))
                return;
            update(state => ({ ...state, rateLimits }));
        });
    }

    onMessage('UPDATING_START', () => {
        update(state => ({ ...state, isUpdating: true }));
        void nProgress.start();
    });

    onMessage('UPDATING_END', () => {
        update(state => ({ ...state, isUpdating: false }));
        void nProgress.done();
    });

    function setRateLimits(rateLimits: RateLimits) {
        if (rateLimits.reset && !IS_TEST) {
            rateLimits.reset = Date.now() + rateLimits.reset * 1000;
            void session.saveRateLimits(rateLimits);
        }
        update(state => ({ ...state, rateLimits }));
    }

    onMessage('RATE_LIMITS', (payload) => {
        setRateLimits({ ...(payload as RateLimits) });
    });

    return { subscribe, update, set, setRateLimits };
}

export const msgStore = createMessageStore();

export const isUpdating = derived(msgStore, ($store, set) => {
    set($store.isUpdating);
});

export const rateLimits = derived<typeof msgStore, RateLimits>(msgStore, ($store, set) => {
    const wait = ($store.rateLimits.reset || 0) - Date.now();
    const timeoutId
        = wait > 0
            ? setTimeout(() => {
                    msgStore.update(state => ({ ...state, rateLimits: { used: null, reset: null, remaining: null } }));
                }, wait)
            : undefined;

    set({ ...$store.rateLimits });

    return () => {
        clearTimeout(timeoutId);
    };
});

function createBlockStore() {
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
export const isBlocked = createBlockStore();
