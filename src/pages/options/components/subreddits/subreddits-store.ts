import storage from '@/storage';
import type { SubredditOpts } from '@/storage/storage-types';
import { generateId } from '@/utils';
import { writable } from 'svelte/store';

const genEmpty = (): SubredditOpts => ({ id: generateId(), subreddit: '' });

function createStore() {
    // const { set, subscribe, update } = writable<SubredditOpts[]>([], () => {
    const { set, subscribe, update } = writable<SubredditOpts[]>([], () => {
        void storage.getSubredditList().then((list) => {
            const empty = genEmpty();
            set(list?.length ? [...list, empty] : [empty]);
        });
    });

    async function saveOptions(subOpts: SubredditOpts, clearData?: boolean) {
        update((prev) => prev.map((opts) => (opts.id === subOpts.id ? subOpts : opts)));
        await storage.saveSubredditOpts(subOpts);
        if (clearData) {
            await storage.removePostsFrom({ subredditId: subOpts.id, clearTS: true });
        }
    }

    async function deleteSubreddit(id: string) {
        await storage.removeSubreddits([id]);
        update((prev) => prev.filter((s) => s.id !== id));
    }

    return {
        set,
        subscribe,
        update,
        addSubreddit: () => update((prev) => [...prev, genEmpty()]),
        saveOptions,
        deleteSubreddit,
    };
}

export const subredditStore = createStore();

export type InputStatus = { typing?: boolean | null; error?: string | null; saved?: boolean | null };
export const inputStatusStore = writable<Record<string | number, InputStatus>>({});
