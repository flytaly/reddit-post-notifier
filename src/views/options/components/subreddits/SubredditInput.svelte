<script lang="ts">
    import type { PostFilterOptions, SubredditOpts } from '@/storage/storage-types';
    import { debounce, testMultireddit } from '@/utils';
    import getMsg from '@/utils/get-message';
    import * as icons from '@/views/options/icons';
    import type { FilterRule, SearchableField } from '@/text-search/post-filter';
    import PostFilterBlock from './PostFilterBlock.svelte';
    import { subredditStore, inputStatusStore } from './subreddits-store';
    import type { InputStatus } from './subreddits-store';

    export let subOpts: SubredditOpts;
    export let error = '';
    $inputStatusStore[subOpts.id] = { error };

    let inputStatus: InputStatus = {};
    let isActive = !subOpts.disabled;
    let filterOpts: PostFilterOptions;
    let ruleList: FilterRule[];

    let showFilterBlock = false;
    let subredditInputRef: HTMLInputElement;

    $: filterOpts = subOpts.filterOpts;
    $: ruleList = filterOpts?.rules || [[{ field: 'title', query: '' }]];

    $: inputStatus = $inputStatusStore[subOpts.id] || {};

    function processFilterOpts(filter?: PostFilterOptions) {
        const result: PostFilterOptions = {
            rules: [],
        };

        const fields = new Set<SearchableField>();

        if (filter?.rules?.length) {
            filter.rules.forEach((rule) => {
                rule.forEach(({ field, query }) => {
                    if (query) fields.add(field);
                });
            });
            result.rules = filter.rules;
        }
        result.fields = Array.from(fields);
        result.enabled = Boolean(result.fields.length);

        return result;
    }

    const saveInputs = async (filter?: PostFilterOptions) => {
        const _subreddit = subOpts.subreddit?.trim().replace(/\s/g, '+');
        if (!_subreddit || !testMultireddit(_subreddit)) {
            const msg = 'Invalid subreddit name';
            subredditInputRef.setCustomValidity(msg);

            $inputStatusStore[subOpts.id] = { error: msg };
            return;
        }
        subredditInputRef.setCustomValidity('');

        await subredditStore.saveOptions(
            {
                id: subOpts.id,
                subreddit: _subreddit,
                disabled: !isActive,
                notify: subOpts.notify,
                filterOpts: processFilterOpts(filter ? filter : subOpts.filterOpts),
            },
            !!filter,
        );

        $inputStatusStore[subOpts.id] = { saved: true };
    };

    const saveInputsDebounced = debounce(saveInputs, 600);

    const inputHandler = () => {
        $inputStatusStore[subOpts.id] = { typing: true };
        saveInputsDebounced();
    };

    let labelText = '';
    const showLabel = (e: Event & { currentTarget: Element }) => {
        labelText = e.currentTarget.getAttribute('aria-label');
    };
    const hideLabel = () => {
        labelText = '';
    };

    /** Activate/toggle input on Enter and Space */
    const labelBtnClick = (e: KeyboardEvent & { currentTarget: HTMLLabelElement }) => {
        if (e.key === 'Enter' || e.key == ' ') {
            e.stopPropagation();
            e.currentTarget.querySelector('input').click();
        }
    };

    const toggleFilters = () => {
        if (!showFilterBlock && !subOpts.filterOpts) {
            subOpts.filterOpts = {
                rules: [[{ field: 'title', query: '' }]],
            };
        }
        showFilterBlock = !showFilterBlock;
    };
</script>

<div class="subreddit-grid rounded-md my-4" class:expanded={showFilterBlock}>
    <div class={`${inputStatus.error ? 'bg-skin-error-bg' : 'bg-transparent'} rounded-t h-full`}>
        <input
            class="rounded w-full"
            type="text"
            bind:this={subredditInputRef}
            bind:value={subOpts.subreddit}
            on:input={inputHandler}
            aria-label={getMsg('optionSubredditsInput')}
        />
    </div>
    <label
        aria-label={getMsg('optionSubredditsDisable')}
        on:focus={showLabel}
        on:mouseover={showLabel}
        on:mouseleave={hideLabel}
        on:keydown={labelBtnClick}
        tabindex="0"
    >
        <input
            class="peer hidden"
            type="checkbox"
            bind:checked={isActive}
            on:change={() => saveInputs()}
            data-testid="isActive"
        />
        <div class="ios-checkbox" />
    </label>
    <label
        class="flex items-center justify-center text-sm"
        aria-label={getMsg('optionSubredditsNotify')}
        on:focus={showLabel}
        on:mouseover={showLabel}
        on:mouseleave={hideLabel}
        on:keydown={labelBtnClick}
        tabindex="0"
    >
        <input
            class="hidden peer"
            type="checkbox"
            bind:checked={subOpts.notify}
            on:change={() => saveInputs()}
            data-testid="notify"
        />
        <div
            class={`flex items-center justify-center select-none
            text-gray-50 rounded-2xl py-[2px] px-2 hover:brightness-110 transition-colors ${
                subOpts.notify ? 'bg-skin-input-checked' : 'bg-gray-500'
            }`}
        >
            {#if subOpts.notify}
                <div class="w-5 h-5">{@html icons.NotifyIcon}</div>
            {:else}
                <div class="w-5 h-5">{@html icons.NotifyOffIcon}</div>
            {/if}
            <span class="ml-[2px]">Notify</span>
        </div>
    </label>
    <button
        class="flex item-center ml-auto py-0 px-0 bg-transparent border-transparent text-skin-accent hover:bg-transparent"
        aria-label={getMsg('optionSubredditsFilter')}
        on:focus={showLabel}
        on:mouseover={showLabel}
        on:mouseleave={hideLabel}
        on:click={toggleFilters}
    >
        <div
            class={`flex items-center justify-center select-none
            text-gray-50 rounded-2xl py-[2px] px-2 hover:brightness-110
            transition-colors ${filterOpts?.enabled ? 'bg-skin-input-checked' : 'bg-gray-500'}`}
        >
            {#if filterOpts?.enabled}
                <div class="w-5 h-5">{@html icons.FilterIcon}</div>
            {:else}
                <div class="w-5 h-5">{@html icons.FilterOffIcon}</div>
            {/if}
            <span class="ml-[2px]">Filters ({filterOpts?.rules?.length || 0})</span>
        </div>
    </button>
    <div>
        <button
            class="flex item-center ml-auto py-0 px-1 bg-transparent border-transparent text-skin-accent"
            aria-label={getMsg('optionSubredditsDelete')}
            on:click={() => subredditStore.deleteSubreddit(subOpts.id)}
            on:focus={showLabel}
            on:mouseover={showLabel}
            on:mouseleave={hideLabel}
        >
            <div class="w-5 h-5">{@html icons.DeleteIcon}</div>
        </button>
    </div>

    <!-- ===== -->
    <!-- ROW 2 -->
    <div class={`rounded-b p-1 text-xs ${inputStatus.error ? 'bg-skin-error-bg' : 'bg-blue'}`}>
        {#if inputStatus.error}
            <div class="flex items-center">
                <div class="w-4 h-4 mr-1 text-skin-error flex-shrink-0">{@html icons.WarningIcon}</div>
                <div>{inputStatus.error}</div>
            </div>
        {:else if inputStatus.saved}
            <div class="flex items-center text-skin-success">
                <div class="w-4 h-4 mr-1 flex-shrink-0">{@html icons.SaveIcon}</div>
                <span class="text-skin-success font-medium">Saved</span>
            </div>
        {:else}
            <span> {inputStatus.typing ? '....' : ''} &nbsp;</span>
        {/if}
    </div>
    <div id="inputs-label" class="p-1 text-right col-start-2 col-span-full text-xs italic">
        <span>{labelText}</span>
        &nbsp;
    </div>
    <div class="col-span-full">
        <!--   -->
    </div>
    {#if showFilterBlock}
        <PostFilterBlock {ruleList} {saveInputs} subId={subOpts.id} />
    {/if}
</div>

<style lang="postcss">
    .subreddit-grid {
        @apply grid p-1 items-start gap-x-3 w-full;

        grid-template-columns: minmax(10rem, 20rem) auto auto auto 1fr;
    }
    .expanded {
        @apply ring-skin-delimiter bg-skin-bg2 shadow-sidebar;
    }
</style>
