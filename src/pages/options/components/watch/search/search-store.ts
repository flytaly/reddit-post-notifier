import storage from '@/storage';
import type { QueryOpts } from '@/storage/storage-types';
import { generateId } from '@/utils';
import { writable } from 'svelte/store';

const genEmpty = (): QueryOpts => ({ id: generateId() });

function createStore() {
    const { set, subscribe, update } = writable<QueryOpts[]>([], () => {
        void storage.getQueriesList().then((list) => {
            /* const empty = genEmpty(); */
            set(list?.length ? [...list] : []);
        });
    });

    async function saveQuery(qOpts: QueryOpts, clearData?: boolean) {
        update((prev) => prev.map((opts) => (opts.id === qOpts.id ? qOpts : opts)));
        await storage.saveQuery(qOpts);
        if (clearData) {
            await storage.removePostsFrom({ searchId: qOpts.id, clearTS: true });
        }
    }

    async function removeQuery(id: string) {
        await storage.removeQueries([id]);
        update((prev) => prev.filter((s) => s.id !== id));
    }

    return {
        set,
        subscribe,
        update,
        addQuery: () => update((prev) => [...prev, genEmpty()]),
        saveQuery,
        removeQuery,
    };
}

export const searchStore = createStore();
