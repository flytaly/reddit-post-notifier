<script lang="ts">
    import DeleteIcon from '../../../assets/delete.svg';
    import SaveIcon from '../../../assets/save.svg';
    import WarningIcon from '../../../assets/warning.svg';
    import NotifyIcon from '../../../assets/notify.svg';
    import NotifyOffIcon from '../../../assets/notify-off.svg';
    import storage from '../../../storage';
    import type { SubredditOpts } from '../../../storage/storage-types';
    import { debounce, testMultireddit } from '../../../utils';
    import getMsg from '../../../utils/get-message';

    export let subOpts: SubredditOpts;
    export let deleteHandler: (id: string) => Promise<unknown>;
    export let error = '';

    let inputStatus: { typing?: boolean; error?: string; saved?: boolean } = { error };

    const { id } = subOpts;
    let { subreddit, disabled, notify } = subOpts;
    let subredditInputRef: HTMLInputElement;
    let savedSubName = subreddit;
    let isActive = !disabled;
    $: disabled = !isActive;

    const saveInputs = async () => {
        const _subreddit = subreddit.trim().replace(/\s/g, '+');

        if (!_subreddit) {
            inputStatus = { error: '' };
            return;
        }
        if (!testMultireddit(_subreddit)) {
            const msg = 'Invalid subreddit name';
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

    let labelText = '';
    const showLabel = (e: Event & { currentTarget: Element }) => {
        labelText = e.currentTarget['ariaLabel'];
    };
    const hideLabel = () => {
        labelText = '';
    };
</script>

<div class="subreddit-grid">
    <div class={`${inputStatus.error ? 'bg-skin-error-bg' : 'bg-skin-bg'} rounded-t`}>
        <input
            class="rounded w-full"
            type="text"
            bind:this={subredditInputRef}
            bind:value={subreddit}
            on:input={inputHandler}
        />
    </div>
    <label
        aria-label={getMsg('optionSubredditsDisable')}
        on:focus={showLabel}
        on:mouseover={showLabel}
        on:mouseleave={hideLabel}
    >
        <input class="peer hidden" type="checkbox" bind:checked={isActive} on:change={saveInputs} />
        <div class="ios-checkbox" />
    </label>
    <label
        class="flex items-center justify-center"
        aria-label={getMsg('optionSubredditsNotify')}
        on:focus={showLabel}
        on:mouseover={showLabel}
        on:mouseleave={hideLabel}
    >
        <input class="hidden peer" type="checkbox" bind:checked={notify} on:change={saveInputs} />
        <div
            class={`flex items-center justify-center select-none
            text-gray-50 rounded-2xl py-[2px] px-2 hover:brightness-110
            transition-colors ${notify ? 'bg-skin-input-checked' : 'bg-gray-500'}`}
        >
            {#if notify}
                <div class="w-5 h-5">{@html NotifyIcon}</div>
            {:else}
                <div class="w-5 h-5">{@html NotifyOffIcon}</div>
            {/if}
            <span>Notify</span>
        </div>
    </label>
    <div>
        <button
            class="flex item-center ml-auto py-0 px-1 bg-transparent border-transparent text-skin-accent"
            aria-label={getMsg('optionSubredditsDelete')}
            on:click={() => deleteHandler(subOpts.id)}
            on:focus={showLabel}
            on:mouseover={showLabel}
            on:mouseleave={hideLabel}
        >
            <div class="w-5 h-5">{@html DeleteIcon}</div>
        </button>
    </div>

    <!-- ===== -->
    <!-- ROW 2 -->
    <div class={`rounded-b p-1 text-xs ${inputStatus.error ? 'bg-skin-error-bg' : 'bg-blue'}`}>
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
    <div id="inputs-label" class="p-1 text-right col-start-2 col-span-full text-xs italic">
        <span>{labelText}</span>
        &nbsp;
    </div>
    <div class="col-span-full">
        <!--   -->
    </div>
</div>

<style lang="postcss">
    .subreddit-grid {
        @apply grid p-1 items-start gap-x-3 w-full;

        grid-template-columns: minmax(10rem, 20rem) auto auto 1fr;
    }
</style>
