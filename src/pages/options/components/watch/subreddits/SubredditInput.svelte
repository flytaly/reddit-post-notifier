<script lang="ts">
    import NotifierApp from '@/notifier/app';
    import * as icons from '@/pages/options/icons';
    import { RefreshIcon2 } from '@/pages/options/icons';
    import { tooltip } from '@/pages/options/tooltip';
    import type { PostFilterOptions, SubredditData, SubredditOpts } from '@/storage/storage-types';
    import type { FilterRule, SearchableField } from '@/text-search/post-filter';
    import { debounce, testMultireddit } from '@/utils';
    import getMsg from '@/utils/get-message';
    import IosCheckbox from '@options/components/common/IosCheckbox.svelte';
    import NotifyToggle from '@options/components/common/NotifyToggle.svelte';
    import Spinner from '@options/components/common/Spinner.svelte';
    import RedditItemsList from '@options/components/RedditItemsList.svelte';
    import { formatError } from '@options/format-error';
    import { isBlocked } from '@options/store';
    import PostFilterBlock from './PostFilterBlock.svelte';
    import type { InputStatus } from './subreddits-store';
    import { inputStatusStore, subredditStore } from './subreddits-store';

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

<div class="subreddit-grid rounded-md" class:expanded={showFilterBlock}>
    <div
        class={`flex border rounded p-0 border-skin-base ${
            inputStatus.error || fetchError ? 'border-skin-error bg-skin-error-bg' : 'bg-transparent'
        } rounded-t h-full`}
    >
        <input
            class="w-full rounded-l rounded-r-none border-none"
            type="text"
            bind:this={subredditInputRef}
            bind:value={subOpts.subreddit}
            on:input={inputHandler}
            aria-label={getMsg('optionSubredditsInput_title')}
        />

        <button
            class="w-min min-w-[5rem] rounded-r rounded-l-none border-0 border-l py-0 px-2 text-xs"
            on:click={() => saveInputs()}
        >
            {#if inputStatus.saved}
                <div class="flex items-center text-skin-success">
                    <div class="mr-1 h-4 w-4 flex-shrink-0">{@html icons.SaveIcon}</div>
                    <span class="font-medium text-skin-success">{getMsg('savedLabel')}</span>
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
        tooltipText={getMsg('optionSubredditsDisable_title')}
        bind:checked={isActive}
        changeHandler={() => saveInputs()}
        data-testid="isActive"
    />

    <NotifyToggle
        bind:checked={subOpts.notify}
        changeHander={() => saveInputs()}
        tooltipText={getMsg('optionSubredditsNotify_title')}
        data-testid="notify"
    />

    <button
        class="item-center ml-auto flex border-transparent bg-transparent py-0 px-0 text-skin-accent hover:bg-transparent"
        use:tooltip={{ content: getMsg('optionSubredditsFilter_title') }}
        aria-label={getMsg('optionSubredditsFilter_title')}
        on:click={toggleFilters}
    >
        <div
            class={`flex items-center justify-center select-none
            text-gray-50 rounded-2xl py-[2px] px-2 hover:brightness-110
            transition-colors ${filterOpts?.enabled ? 'bg-skin-input-checked' : 'bg-skin-gray2'}`}
        >
            {#if filterOpts?.enabled}
                <div class="h-5 w-5">{@html icons.FilterIcon}</div>
            {:else}
                <div class="h-5 w-5">{@html icons.FilterOffIcon}</div>
            {/if}
            <span class="ml-[2px]">
                {getMsg('optionSubredditsFilter')} ({(filterOpts?.enabled && filterOpts?.rules?.length) || 0})
            </span>
        </div>
    </button>
    <div>
        <button
            class="flex items-center border-transparent bg-transparent p-0 text-xs text-skin-text hover:bg-transparent hover:text-skin-accent2 disabled:text-skin-gray"
            on:click={() => void fetchPosts()}
            use:tooltip={{ content: getMsg('optionsSubredditFetchDesc') }}
            disabled={$isBlocked || !subOpts.subreddit || !!inputStatus.error}
        >
            <div class="mr-1 h-5 w-5 text-skin-accent2">
                {@html RefreshIcon2}
            </div>
            <span>{getMsg('optionsSubredditFetch')}</span>
        </button>
    </div>
    <div>
        <button
            class="icon-button ml-auto text-skin-accent"
            aria-label={getMsg('optionSubredditsDelete')}
            use:tooltip={{ content: getMsg('optionSubredditsDelete') }}
            on:click={() => subredditStore.deleteSubreddit(subOpts.id)}
        >
            <div class="h-5 w-5">{@html icons.DeleteIcon}</div>
        </button>
    </div>

    <!-- ===== -->
    <!-- ROW 2 -->
    <div>
        <div class={`rounded-b p-1 text-xs ${inputStatus.error || fetchError ? 'bg-skin-error-bg' : 'bg-blue'}`}>
            {#if inputStatus.error || fetchError}
                <div class="flex items-center">
                    <div class="mr-1 h-4 w-4 flex-shrink-0 text-skin-error">{@html icons.WarningIcon}</div>
                    <div>{inputStatus.error || fetchError}</div>
                </div>
            {/if}
        </div>
    </div>

    <Spinner show={isLoading} />

    {#if showPosts}
        <div class="col-span-full border border-skin-delimiter p-1 ">
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
        @apply grid w-full items-start gap-x-3 p-1;

        grid-template-columns: minmax(10rem, 20rem) max-content max-content max-content max-content 1fr;
    }
    .expanded {
        @apply bg-skin-bg2 shadow-sidebar ring-skin-delimiter;
    }
</style>
