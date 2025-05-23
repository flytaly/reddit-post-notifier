import storage from '@/storage';
import type { SubredditOpts } from '@/storage/storage-types';
import { generateId } from '@/utils';

const genEmpty = (): SubredditOpts => ({
    id: generateId(),
    subreddit: '',
    customFeed: '',
    type: 'subreddit',
    disabled: false,
    notify: false,
    filterOpts: { enabled: false, rules: [], fields: [] },
});

export class SubredditState {
    state = $state<SubredditOpts[]>([]);

    constructor() {}

    async loadFromStorage() {
        return storage.getSubredditList().then((list) => {
            this.state = list?.length ? list : [];
        });
    }

    saveOpts = async (snapshot: SubredditOpts, clearData?: boolean) => {
        await storage.saveSubredditOpts(snapshot);
        if (clearData)
            await storage.removePostsFrom({ subredditId: snapshot.id, clearTS: true });
    };

    addSubreddit = () => {
        this.state = [...this.state, genEmpty()];
    };

    deleteSubreddit = async (id: string) => {
        await storage.removeSubreddits([id]);
        this.state = this.state.filter(s => s.id !== id);
    };
}

export const subState = new SubredditState();

export interface InputStatus { typing?: boolean; error?: string; saved?: boolean }

class InputState {
    private _status = $state({} as Record<string, InputStatus>);

    set(id: string, status: InputStatus) {
        this._status[id] = {
            typing: status.typing || false,
            error: status.error || '',
            saved: status.saved || false,
        };
    }

    get(id: string) {
        return this._status[id] || {};
    }
}

export const inputState = new InputState();
