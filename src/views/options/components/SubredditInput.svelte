<script lang="ts">
    import storage from '../../../storage';

    import type { SubredditOpts } from '../../../storage/storage-types';
    import { debounce, testMultireddit } from '../../../utils';

    export let subOpts: SubredditOpts;

    const { id } = subOpts;
    let { subreddit, disabled, notify } = subOpts;
    let subredditInputRef: HTMLInputElement;

    const saveInputs = async () => {
        const _subreddit = subreddit.trim().replace(/\s/g, '+');

        if (!_subreddit) return;
        if (!testMultireddit(_subreddit)) {
            subredditInputRef.setCustomValidity(`Invalid subreddit names`);
            return;
        }
        subredditInputRef.setCustomValidity('');
        await storage.saveSubredditOpts({ id, subreddit: _subreddit, disabled, notify });
        console.log('saved');
    };

    const saveInputsDebounced = debounce(saveInputs, 400);
</script>

<form method="POST" class="flex space-x-2 my-2">
    <input type="text" bind:this={subredditInputRef} bind:value={subreddit} on:input={saveInputsDebounced} />
    <label class="flex items-center space-x-1">
        <input type="checkbox" bind:checked={notify} on:change={saveInputs} />
        <span>notify</span>
    </label>
    <label class="flex items-center space-x-1">
        <input type="checkbox" bind:checked={disabled} on:change={saveInputs} />
        <span>disabled</span>
    </label>
</form>

<style>
    /* your styles go here */
</style>
