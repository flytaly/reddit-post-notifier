<script lang="ts">
    import NotifierApp from '@/notifier/app';
    import type { PostFilterOptions, SubredditData, SubredditOpts } from '@/storage/storage-types';
    import type { FilterRule, SearchableField } from '@/text-search/post-filter';
    import { debounce, testMultireddit } from '@/utils';
    import getMsg from '@/utils/get-message';
    import * as icons from '@/pages/options/icons';
    import { RefreshIcon2 } from '@/pages/options/icons';
    import { formatError } from '../../format-error';
    import { isBlocked } from '../../store';
    import RedditItemsList from '../RedditItemsList.svelte';
    import PostFilterBlock from './PostFilterBlock.svelte';
    import type { InputStatus } from './subreddits-store';
    import { inputStatusStore, subredditStore } from './subreddits-store';
    import Spinner from '../common/Spinner.svelte';
    import IosCheckbox from '../common/IosCheckbox.svelte';
    import NotifyToggle from '../common/NotifyToggle.svelte';

    export let subOpts: SubredditOpts;
    export let subData: SubredditData = {};

    let inputStatus: InputStatus = {};
    let isActive = !subOpts.disabled;
    let filterOpts: PostFilterOptions;
    let ruleList: FilterRule[];
    let fetchError = '';
    let showPosts = false;
    let isLoading = false;

    let showFilterBlock = false;
    let subredditInputRef: HTMLInputElement;

    $: filterOpts = subOpts.filterOpts || {};
    $: ruleList = filterOpts?.rules || [[{ field: 'title', query: '' }]];
    $: inputStatus = $inputStatusStore[subOpts.id] || {};
    $: fetchError = formatError(subData.error);

    const fetchPosts = async () => {
        if (!subOpts.subreddit || inputStatus.error) return;
        isLoading = true;
        showPosts = false;
        isBlocked.block();
        const app = new NotifierApp();
        try {
            await app.updateSubreddit({
                subOpts,
                subData: { ...subData, lastPostCreated: 0, posts: [], error: null },
            });
        } catch (e: unknown) {
            fetchError = (e as { message?: string }).message || '';
        }
        isLoading = false;
        showPosts = true;
    };

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

        const shouldRemoveData = !!filter;

        if (shouldRemoveData && showPosts) {
            showPosts = false;
        }

        await subredditStore.saveOptions(
            {
                id: subOpts.id,
                subreddit: _subreddit,
                disabled: !isActive,
                notify: subOpts.notify,
                filterOpts: processFilterOpts(filter ? filter : subOpts.filterOpts),
            },
            shouldRemoveData,
        );

        fetchError = '';
        $inputStatusStore[subOpts.id] = { saved: true };
    };

    const saveInputsDebounced = debounce(saveInputs, 600);

    const inputHandler = () => {
        $inputStatusStore[subOpts.id] = { typing: true };
        saveInputsDebounced();
    };

    let labelText = '';
    const showLabel = (e: Event) => {
        labelText = (e.currentTarget as HTMLElement).getAttribute('aria-label') || '';
    };
    const hideLabel = () => {
        labelText = '';
    };

    const toggleFilters = () => {
        if (!showFilterBlock && !subOpts.filterOpts) {
            subOpts.filterOpts = {
                rules: [[{ field: 'title', query: '' }]],
            };
        }

        if (!showFilterBlock && showPosts) showPosts = false;
        showFilterBlock = !showFilterBlock;
    };
</script>

<div class="subreddit-grid rounded-md my-4" class:expanded={showFilterBlock}>
    <div
        class={`flex border rounded p-0 border-skin-base ${
            inputStatus.error || fetchError ? 'border-skin-error bg-skin-error-bg' : 'bg-transparent'
        } rounded-t h-full`}
    >
        <input
            class="rounded-l rounded-r-none w-full border-none"
            type="text"
            bind:this={subredditInputRef}
            bind:value={subOpts.subreddit}
            on:input={inputHandler}
            on:focus={showLabel}
            on:mouseover={showLabel}
            on:mouseleave={hideLabel}
            aria-label={getMsg('optionSubredditsInput_title')}
        />

        <button
            class="min-w-[5rem] py-0 px-2 border-0 border-l rounded-r rounded-l-none w-min text-xs"
            on:click={() => saveInputs()}
        >
            {#if inputStatus.saved}
                <div class="flex items-center text-skin-success">
                    <div class="w-4 h-4 mr-1 flex-shrink-0">{@html icons.SaveIcon}</div>
                    <span class="text-skin-success font-medium">{getMsg('savedLabel')}</span>
                </div>
            {:else if inputStatus.error}
                <div class="flex justify-center">
                    <div class="h-5 w-5 text-skin-error">
                        {@html icons.WarningIcon}
                    </div>
                </div>
            {:else}
                <span>{inputStatus.typing ? '...' : ''} &nbsp;</span>
            {/if}
        </button>
    </div>

    <IosCheckbox
        aria-label={getMsg('optionSubredditsDisable_title')}
        on:focus={showLabel}
        on:mouseover={showLabel}
        on:mouseleave={hideLabel}
        bind:checked={isActive}
        changeHandler={() => saveInputs()}
        data-testid="isActive"
    />

    <NotifyToggle
        bind:checked={subOpts.notify}
        changeHander={() => saveInputs()}
        aria-label={getMsg('optionSubredditsNotify_title')}
        on:focus={showLabel}
        on:mouseover={showLabel}
        on:mouseleave={hideLabel}
        data-testid="notify"
    />

    <button
        class="flex item-center ml-auto py-0 px-0 bg-transparent border-transparent text-skin-accent hover:bg-transparent"
        aria-label={getMsg('optionSubredditsFilter_title')}
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
            <span class="ml-[2px]"
                >{getMsg('optionSubredditsFilter')} ({(filterOpts?.enabled && filterOpts?.rules?.length) || 0})</span
            >
        </div>
    </button>
    <div>
        <button
            class="icon-button text-skin-accent ml-auto"
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
    <div>
        <div class={`rounded-b p-1 text-xs ${inputStatus.error || fetchError ? 'bg-skin-error-bg' : 'bg-blue'}`}>
            {#if inputStatus.error || fetchError}
                <div class="flex items-center">
                    <div class="w-4 h-4 mr-1 text-skin-error flex-shrink-0">{@html icons.WarningIcon}</div>
                    <div>{inputStatus.error || fetchError}</div>
                </div>
            {/if}
        </div>
        <button
            class="flex items-center text-skin-accent2 p-0 border-transparent bg-transparent hover:bg-transparent text-xs"
            on:click={() => void fetchPosts()}
            title={getMsg('optionsSubredditFetch_title')}
            disabled={$isBlocked || !subOpts.subreddit || !!inputStatus.error}
        >
            <div class="w-5 h-5 mr-1">
                {@html RefreshIcon2}
            </div>
            <span>{getMsg('optionsSubredditFetch')}</span>
        </button>
    </div>
    <div id="inputs-label" class="p-1 mb-2 text-right col-start-2 col-span-full text-xs italic">
        <span>{labelText}</span>
        &nbsp;
    </div>

    <Spinner show={isLoading} />

    {#if showPosts}
        <div class="col-span-full border p-1 border-skin-delimiter ">
            <RedditItemsList
                title={`The latest posts in the subreddit. ${
                    subOpts.filterOpts?.enabled ? 'With filters.' : 'Without filters.'
                }`}
                items={subData.posts || []}
                limit={10}
                onClose={() => {
                    showPosts = false;
                }}
            />
        </div>
    {/if}

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
