<script lang="ts">
    import NotifierApp from '@/notifier/app';
    import type { PostFilterOptions, SubredditData, SubredditOpts } from '@/storage/storage-types';
    import type { FilterRule, SearchableField } from '@/text-search/post-filter';
    import { debounce, testMultireddit } from '@/utils';
    import getMsg from '@/utils/get-message';
    import RedditItemsList from '@options/components/RedditItemsList.svelte';
    import TooltipIcon from '@options/components/TooltipIcon.svelte';
    import NotifyToggle from '@options/components/common/NotifyToggle.svelte';
    import Spinner from '@options/components/common/Spinner.svelte';
    import { formatError } from '@options/lib/format-error';
    import * as icons from '@options/lib/icons';
    import { isBlocked } from '@options/lib/store';
    import { tooltip } from '@options/lib/tooltip';
    import WatchItem from '../WatchItem.svelte';
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

    let showEditBlock = !subOpts?.subreddit;
    let subredditInputRef: HTMLInputElement;

    $: filterOpts = subOpts.filterOpts || {};
    $: ruleList = filterOpts?.rules || [];
    $: inputStatus = $inputStatusStore[subOpts.id] || {};
    $: fetchError = formatError(subData.error);
    $: errorMessage = inputStatus.error || fetchError;

    const getName = () => subOpts.name || `r/${subOpts.subreddit}`;

    const fetchPosts = async () => {
        if (!subOpts.subreddit || inputStatus.error) return;
        isLoading = true;
        showPosts = false;
        isBlocked.block();
        const app = new NotifierApp();
        app.reddit.fetchOpts = { cache: 'default' };
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
            const msg = 'Invalid subreddit/multireddit name';
            subredditInputRef?.setCustomValidity(msg);

            $inputStatusStore[subOpts.id] = { error: msg };
            return;
        }
        subredditInputRef?.setCustomValidity('');

        const shouldRemoveData = !!filter;

        if (shouldRemoveData && showPosts) {
            showPosts = false;
        }

        await subredditStore.saveOptions(
            {
                id: subOpts.id,
                subreddit: _subreddit,
                name: subOpts.name,
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

    const toggleEditBlock = () => {
        if (!showEditBlock && showPosts) showPosts = false;
        showEditBlock = !showEditBlock;
    };

    const onFilterClick = () => {
        if (!showEditBlock && !subOpts.filterOpts) {
            subOpts.filterOpts = {
                rules: [[{ field: 'title', query: '' }]],
            };
        }
        toggleEditBlock();
    };
</script>

<WatchItem
    bind:isActive
    bind:showEditBlock
    name={subOpts.name || subOpts.subreddit || showEditBlock ? getName() : 'click here to edit...'}
    onActiveToggle={() => void saveInputs()}
    onDelete={() => void subredditStore.deleteSubreddit(subOpts.id)}
    onFetch={() => void fetchPosts()}
    disabled={$isBlocked || !subOpts.subreddit || !!inputStatus.error}
    {errorMessage}
>
    <div slot="posts-block">
        <!-- Post list row -->
        <div class="col-span-full">
            <Spinner show={isLoading} />
            {#if showPosts}
                <div class="col-span-full mt-2 border border-skin-delimiter p-1">
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
        </div>
    </div>

    <div slot="toggles" class="flex gap-3">
        <NotifyToggle
            bind:checked={subOpts.notify}
            changeHandler={() => saveInputs()}
            tooltipText={getMsg('optionSubredditsNotify_title')}
            data-testid="notify"
        />
        <!-- Toggle Filters -->
        <button
            class="toggle-button"
            class:toggle-button-on={filterOpts?.enabled}
            use:tooltip={{ content: getMsg('optionSubredditsFilter_title') }}
            aria-label={getMsg('optionSubredditsFilter_title')}
            on:click={onFilterClick}
        >
            {#if filterOpts?.enabled}
                <div class="h-5 w-5">{@html icons.FilterIcon}</div>
            {:else}
                <div class="h-5 w-5">{@html icons.FilterOffIcon}</div>
            {/if}
            <span class="ml-[2px]">
                {getMsg('optionSubredditsFilter')} ({(filterOpts?.enabled && filterOpts?.rules?.length) || 0})
            </span>
        </button>
    </div>
    <div>
        <div class="col-span-full m-2 pb-2">
            <div class="mb-3 flex justify-between rounded-b text-xs">
                {#if errorMessage}
                    <div class="flex items-center font-bold text-skin-error">
                        <div class="mr-1 h-4 w-4 flex-shrink-0 text-skin-error">{@html icons.WarningIcon}</div>
                        <div>{errorMessage}</div>
                    </div>
                {/if}
                <div class="mr-4 min-h-[1rem] font-medium text-skin-success">
                    {#if inputStatus.saved}
                        <div class="flex items-center">
                            <div class="mr-1 h-4 w-4 flex-shrink-0">{@html icons.SaveIcon}</div>
                            <span>{getMsg('savedLabel')}</span>
                        </div>
                    {:else}
                        <span>{inputStatus.typing ? '...' : ''} &nbsp;</span>
                    {/if}
                </div>
            </div>

            <div class="mb-4 grid grid-cols-[auto,1fr] items-center gap-2 text-sm">
                <label for={`name_${subOpts.id}`}>{getMsg('optionSubredditsInputNameLabel')}</label>
                <div class="flex items-center gap-2">
                    <input
                        id={`name_${subOpts.id}`}
                        class="w-full max-w-[20rem] rounded border border-skin-base"
                        type="text"
                        bind:value={subOpts.name}
                        on:input={inputHandler}
                        aria-label={getMsg('optionSubredditsInputName_title')}
                        placeholder={getMsg('optionSubredditsInputName_placeholder')}
                    />
                    <TooltipIcon message={getMsg('optionSubredditsInputName_title')} />
                </div>

                <label class="font-bold" for={`subreddit_${subOpts.id}`}>{getMsg('optionSubredditsInputLabel')}</label>
                <div class="flex items-center gap-2">
                    <input
                        id={`subreddit_${subOpts.id}`}
                        class:error={errorMessage}
                        class="w-full max-w-[20rem] rounded border border-skin-base"
                        type="text"
                        bind:this={subredditInputRef}
                        bind:value={subOpts.subreddit}
                        on:input={inputHandler}
                        aria-label={getMsg('optionSubredditsInput_title')}
                        placeholder={getMsg('optionSubredditsInput_placeholder')}
                    />
                    <TooltipIcon message={getMsg('optionSubredditsInput_title')} />
                </div>
            </div>
            <PostFilterBlock {ruleList} {saveInputs} subId={subOpts.id} />
        </div>
    </div>
</WatchItem>

<style lang="postcss">
    .error {
        @apply border-skin-error;
    }
</style>
