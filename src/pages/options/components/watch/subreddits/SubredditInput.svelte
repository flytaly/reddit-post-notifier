<script lang='ts'>
    import NotifierApp from '@/notifier/app';
    import type { PostFilterOptions, SubredditData } from '@/storage/storage-types';
    import type { SearchableField } from '@/text-search/post-filter';
    import { debounce, testMultireddit, testCustomFeed } from '@/utils';
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
    import { inputState, subState } from './state.svelte';

    interface Props {
        subData?: SubredditData;
        index: number;
    }

    let { subData = {}, index }: Props = $props();

    let subOpts = $derived(subState.state[index]);

    let filterOpts: PostFilterOptions = $derived(subOpts.filterOpts || {});

    let fetchError = $state('');
    let showPosts = $state(false);
    let isLoading = $state(false);

    let showEditBlock = $state(!subState.state[index].subreddit && !subState.state[index].customFeed);
    let subredditInputRef = $state<HTMLInputElement | null>(null);
    let customFeedInputRef = $state<HTMLInputElement | null>(null);

    $effect(() => {
        fetchError = formatError(subData.error);
    });

    let errorMessage = $derived(inputState.get(subOpts.id).error || fetchError);

    const fetchPosts = async () => {
        if (inputState.get(subOpts.id).error) return;
        const isCustomFeed = subOpts.type === 'custom_feed';
        if (isCustomFeed && !subOpts.customFeed) return;
        if (!isCustomFeed && !subOpts.subreddit) return;
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
        }
        catch (e: unknown) {
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
                    if (query)
                        fields.add(field);
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
        const _customFeed = subOpts.customFeed?.trim().replace(/^\/+|\/+$/g, '');

        subredditInputRef?.setCustomValidity('');
        customFeedInputRef?.setCustomValidity('');
        inputState.set(subOpts.id, { error: '' });

        switch (subOpts.type) {
            case 'custom_feed':
                if (!_customFeed || !testCustomFeed(_customFeed)) {
                    const msg = 'Invalid custom feed link';
                    customFeedInputRef?.setCustomValidity(msg);
                    inputState.set(subOpts.id, { error: msg });
                    return;
                }
                break;
            default:
                if (!_subreddit || !testMultireddit(_subreddit)) {
                    const msg = 'Invalid subreddit/multireddit name';
                    subredditInputRef?.setCustomValidity(msg);
                    inputState.set(subOpts.id, { error: msg });
                    return;
                }
        }

        const shouldRemoveData = !!filter;

        if (shouldRemoveData && showPosts) showPosts = false;

        if (filter) {
            subOpts.filterOpts = processFilterOpts(filter);
        }

        const snapshot = $state.snapshot(subOpts);
        snapshot.subreddit = _subreddit;
        snapshot.customFeed = _customFeed;
        await subState.saveOpts(snapshot, shouldRemoveData);

        fetchError = '';
        inputState.set(subOpts.id, { saved: true });
    };

    const saveInputsDebounced = debounce(saveInputs, 600);

    const inputHandler = () => {
        inputState.set(subOpts.id, { typing: true });
        saveInputsDebounced();
    };

    const toggleEditBlock = () => {
        if (!showEditBlock && showPosts) showPosts = false;
        showEditBlock = !showEditBlock;
    };

    const onFilterClick = () => {
        if (!showEditBlock && !subOpts.filterOpts?.rules?.length) {
            subOpts.filterOpts = {
                rules: [[{ field: 'title', query: '' }]],
            };
        }
        toggleEditBlock();
    };

    let fetchBlocked = $derived.by(() => {
        if ($isBlocked || inputState.get(subOpts.id).error) return true;
        if (subOpts.type === 'custom_feed' && !subOpts.customFeed) return true;
        if (subOpts.type !== 'custom_feed' && !subOpts.subreddit) return true;
        return false;
    });

    let inputName = $derived.by(() => {
        if (subOpts.name) return subOpts.name;
        if (subOpts.type === 'custom_feed' && subOpts.customFeed) return subOpts.customFeed;
        if (subOpts.type !== 'custom_feed' && subOpts.subreddit) return `r/${subOpts.subreddit}`;
        return showEditBlock ? '' : 'click here to edit...';
    });
</script>

<WatchItem
    itemDisabled={subOpts.disabled}
    bind:showEditBlock
    name={inputName}
    onActiveToggle={(e) => {
        subOpts.disabled = !e.currentTarget.checked;
        void saveInputs();
    }}
    onDelete={() => void subState.deleteSubreddit(subOpts.id)}
    onFetch={() => void fetchPosts()}
    onCollapse={() => showPosts = false}
    fetchBlocked={fetchBlocked}
    {errorMessage}
>
    {#snippet posts()}
        <div>
            <!-- Post list row -->
            <div class='col-span-full'>
                <Spinner show={isLoading} />
                {#if showPosts}
                    <div class='col-span-full mt-2 border border-skin-delimiter p-1'>
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
    {/snippet}

    {#snippet toggles()}
        <div class='flex gap-3'>
            <NotifyToggle
                bind:checked={subOpts.notify}
                changeHandler={() => saveInputs()}
                tooltipText={getMsg('optionSubredditsNotify_title')}
                data-testid='notify'
            />
            <!-- Toggle Filters -->
            <button
                class={[
                    'toggle-button',
                    { 'toggle-button-on': filterOpts?.enabled },
                ]}
                use:tooltip={{ content: getMsg('optionSubredditsFilter_title') }}
                aria-label={getMsg('optionSubredditsFilter_title')}
                onclick={onFilterClick}
            >
                {#if filterOpts?.enabled}
                    <div class='h-5 w-5'>{@html icons.FilterIcon}</div>
                {:else}
                    <div class='h-5 w-5'>{@html icons.FilterOffIcon}</div>
                {/if}
                <span class='ml-[2px]'>
                    {getMsg('optionSubredditsFilter')} ({(filterOpts?.enabled && filterOpts?.rules?.length) || 0})
                </span>
            </button>
        </div>
    {/snippet}

    <!-- Children-->
    <div>
        <div class='col-span-full m-2 pb-2'>
            <div class='mb-3 flex justify-between rounded-b text-xs'>
                {#if errorMessage}
                    <div class='flex items-center font-bold text-skin-error'>
                        <div class='mr-1 h-4 w-4 flex-shrink-0 text-skin-error'>{@html icons.WarningIcon}</div>
                        <div>{errorMessage}</div>
                    </div>
                {/if}
                <div class='mr-4 min-h-[1rem] font-medium text-skin-success'>
                    {#if inputState.get(subOpts.id).saved}
                        <div class='flex items-center'>
                            <div class='mr-1 h-4 w-4 flex-shrink-0'>{@html icons.SaveIcon}</div>
                            <span>{getMsg('savedLabel')}</span>
                        </div>
                    {:else}
                        <span>{inputState.get(subOpts.id).typing ? '...' : ''} &nbsp;</span>
                    {/if}
                </div>
            </div>

            <div class='mb-4 grid grid-cols-[auto_1fr] items-center gap-2 text-sm max-w-fit'>
                <label for={`name_${subOpts.id}`}>{getMsg('optionSubredditsInputNameLabel')}</label>
                <div class='flex items-center gap-2'>
                    <input
                        id={`name_${subOpts.id}`}
                        class='w-full rounded border border-skin-border'
                        type='text'
                        bind:value={subOpts.name}
                        oninput={inputHandler}
                        aria-label={getMsg('optionSubredditsInputName_title')}
                        placeholder={getMsg('optionSubredditsInputName_placeholder')}
                    />
                    <TooltipIcon message={getMsg('optionSubredditsInputName_title')} />
                </div>

                <select
                    class='rounded py-1 border-none bg-transparent hover:bg-skin-input hover:shadow-none focus:bg-skin-input font-bold text-sm'
                    name="subredditType"
                    bind:value={subOpts.type}
                    onchange={inputHandler}
                    id="typeSelection"
                >
                    <option value="subreddit">{getMsg('optionSubredditsInputLabel')}</option>
                    <option value="custom_feed">{getMsg('optionSubredditsCustomFeedInputLabel')}</option>
                </select>
                <div class='flex items-center gap-2'>
                    {#if subOpts.type === 'custom_feed'}
                        <div class="text-skin-gray/80">reddit.com/user/</div>
                        <input
                            id={`subreddit_${subOpts.id}`}
                            class={[
                                'w-[20rem] max-w-full rounded border',
                                errorMessage ? 'border-skin-error' : 'border-skin-border',
                            ]}
                            type='text'
                            bind:this={customFeedInputRef}
                            bind:value={subOpts.customFeed}
                            oninput={inputHandler}
                            aria-label={getMsg('optionSubredditsCustomFeedInput_title')}
                            placeholder={getMsg('optionSubredditsCustomFeedInput_placeholder')}
                            data-testid='customFeedInput'
                        />
                        <TooltipIcon message={getMsg('optionSubredditsCustomFeedInput_title')} />
                    {:else }
                        <div class="text-skin-gray/80">r/</div>
                        <input
                            id={`customFeed_${subOpts.id}`}
                            class={[
                                'w-[20rem] max-w-full rounded border',
                                errorMessage ? 'border-skin-error' : 'border-skin-border',
                            ]}
                            type='text'
                            bind:this={subredditInputRef}
                            bind:value={subOpts.subreddit}
                            oninput={inputHandler}
                            aria-label={getMsg('optionSubredditsInput_title')}
                            placeholder={getMsg('optionSubredditsInput_placeholder')}
                            data-testid='subredditInput'
                        />
                        <TooltipIcon message={getMsg('optionSubredditsInput_title')} />
                    {/if}
                </div>
            </div>
            <PostFilterBlock subIndex={index} {saveInputs} subId={subOpts.id} />
        </div>
    </div>
</WatchItem>
