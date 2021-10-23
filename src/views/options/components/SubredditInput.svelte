<script lang="ts">
    import storage from '../../../storage';
    import WarningIcon from '../../../assets/warning.svg';
    import SaveIcon from '../../../assets/save.svg';
    import DeleteIcon from '../../../assets/delete.svg';

    import type { SubredditOpts } from '../../../storage/storage-types';
    import { debounce, testMultireddit } from '../../../utils';

    export let subOpts: SubredditOpts;
    export let deleteHandler: () => Promise<unknown>;
    export let error = '';

    let inputStatus: { typing?: boolean; error?: string; saved?: boolean } = { error };

    const { id } = subOpts;
    let { subreddit, disabled, notify } = subOpts;
    let subredditInputRef: HTMLInputElement;
    let savedSubName = subreddit;

    const saveInputs = async () => {
        const _subreddit = subreddit.trim().replace(/\s/g, '+');

        if (!_subreddit) {
            inputStatus = { error: '' };
            return;
        }
        if (!testMultireddit(_subreddit)) {
            const msg = 'Invalid subreddit (multireddit) name';
            subredditInputRef.setCustomValidity(msg);
            inputStatus = { error: msg };
            return;
        }
        subredditInputRef.setCustomValidity('');
        await storage.saveSubredditOpts({ id, subreddit: _subreddit, disabled, notify });

        inputStatus = { saved: true };
        if (savedSubName !== subreddit) {
            savedSubName = subreddit;
        }
    };

    const saveInputsDebounced = debounce(saveInputs, 600);

    const inputHandler = () => {
        inputStatus = { typing: true };
        saveInputsDebounced();
    };
</script>

<div class="p-1 my-2">
    <div class="flex space-x-2 items-start">
        <div class={`w-56 group ${inputStatus.error ? 'bg-skin-error-bg' : 'bg-skin-bg'}`}>
            <input
                class="rounded w-full"
                type="text"
                bind:this={subredditInputRef}
                bind:value={subreddit}
                on:input={inputHandler}
            />
            <div class="rounded-b p-1 text-xs   group-focus-within:block">
                {#if inputStatus.error}
                    <div class="flex items-center">
                        <div class="w-4 h-4 mr-1 text-skin-error flex-shrink-0">{@html WarningIcon}</div>
                        <div>{inputStatus.error}</div>
                    </div>
                {:else if inputStatus.saved}
                    <div class="flex items-center text-skin-success">
                        <div class="w-4 h-4 mr-1 flex-shrink-0">{@html SaveIcon}</div>
                        <span class="text-skin-success font-medium">Saved</span>
                    </div>
                {:else}
                    <span>{inputStatus.typing ? '....' : ''} &nbsp;</span>
                {/if}
            </div>
        </div>
        <label class="flex items-center space-x-1">
            <input type="checkbox" bind:checked={notify} on:change={saveInputs} />
            <span>notify</span>
        </label>
        <label class="flex items-center space-x-1">
            <input type="checkbox" bind:checked={disabled} on:change={saveInputs} />
            <span>disabled</span>
        </label>
        <button
            class="flex item-center m-0 py-0 px-1 bg-transparent border-transparent text-skin-accent"
            on:click={deleteHandler.bind(null, subOpts.id)}
        >
            <div class="w-5 h-5">{@html DeleteIcon}</div>
        </button>
    </div>
</div>

<style lang="postcss">
</style>
