<script lang='ts'>
    import { SaveIcon, WarningIcon } from '@options/lib/icons';
    import { isBlocked } from '@options/lib/store';
    import { formatError } from '@options/lib/format-error';
    import RedditItemsList from '@options/components/RedditItemsList.svelte';
    import TooltipIcon from '@options/components/TooltipIcon.svelte';
    import Spinner from '@options/components/common/Spinner.svelte';
    import NotifyToggle from '@options/components/common/NotifyToggle.svelte';
    import WatchItem from '../WatchItem.svelte';
    import { searchStore } from './search-store';
    import getMsg from '@/utils/get-message';
    import { debounce, testMultireddit } from '@/utils';
    import type { QueryData, QueryOpts } from '@/storage/storage-types';
    import NotifierApp from '@/notifier/app';

    interface Props {
        queryObject: QueryOpts;
        queryData: QueryData;
    }

    let { queryObject, queryData }: Props = $props();

    let query = $state(queryObject.query || '');
    let name = $state(queryObject.name || '');
    let subreddit = $state(queryObject.subreddit || '');
    let notify = $state(!!queryObject.notify);
    let isActive = $state(!queryObject.disabled);
    let showEditBlock = $state(!queryObject.query);

    let subredditInputRef: HTMLInputElement | undefined = $state();
    let isLoading = $state(false);
    let showPosts = $state(false);
    let saveMsg = $state('');

    let errorMessage = $state('');
    let subredditError = $state('');
    let fetchError = $state('');

    $effect(() => {
        fetchError = formatError(queryData.error);
    });

    $effect(() => {
        errorMessage = subredditError || fetchError;
    });

    let searchBlockName = $derived.by(() => {
        if (!name && !query && !showEditBlock)
            return 'click here to edit...';
        return name || query || '';
    });

    let ids = $derived.by(() => {
        const id = queryObject.id;
        return {
            name: `search_name_${id}`,
            subreddit: `search_subreddit_${id}`,
            query: `search_query_${id}`,
        };
    });

    const saveInputs = debounce(async () => {
        const _query = query.trim();
        if (!_query)
            return;
        fetchError = '';
        subredditError = '';
        showPosts = false;
        const _subreddit = subreddit?.trim().replace(/\s/g, '+');
        if (_subreddit && !testMultireddit(_subreddit)) {
            const msg = 'Invalid subreddit name';
            subredditInputRef?.setCustomValidity(msg);
            subredditError = msg;
            return;
        }

        subredditInputRef?.setCustomValidity('');

        await searchStore.saveQuery({
            ...queryObject,
            notify: notify,
            name: name.trim(),
            subreddit: _subreddit,
            query: _query,
            disabled: !isActive,
        });
        saveMsg = 'saved';
    }, 500);

    const inputHandler = () => {
        saveMsg = '...';
        saveInputs();
    };

    const deleteHandler = () => {
        void searchStore.removeQuery(queryObject.id);
    };

    const fetchPosts = async () => {
        isLoading = true;
        showPosts = false;
        isBlocked.block();
        try {
            const app = new NotifierApp();
            app.reddit.fetchOpts = { cache: 'default' };
            await app.updateQuery({
                query: { ...queryObject, name, subreddit, query },
                queryData: { ...queryData, lastPostCreated: 0, posts: [], error: null },
            });
        }
        catch (e: unknown) {
            fetchError = (e as { message?: string }).message || '';
        }
        isLoading = false;
        showPosts = true;
    };
</script>

<WatchItem
    bind:showEditBlock
    itemDisabled={isActive}
    name={searchBlockName}
    onActiveToggle={(e) => {
        isActive = !e.currentTarget.checked;
        void saveInputs();
    }}
    onDelete={deleteHandler}
    onFetch={() => void fetchPosts()}
    fetchBlocked={$isBlocked || !query || !!subredditError}
    data-testid='search-inputs'
    {errorMessage}
>
    {#snippet posts()}
        <!-- Post list row -->
        <div class='col-span-full'>
            <Spinner show={isLoading} />

            {#if showPosts}
                <div class='border border-skin-delimiter p-1'>
                    <RedditItemsList
                        title='The latest posts in the search.'
                        items={queryData.posts || []}
                        limit={8}
                        onClose={() => {
                            showPosts = false;
                        }}
                    />
                </div>
            {/if}
        </div>
    {/snippet}

    {#snippet toggles()}
        <div class='flex gap-3'>
            <NotifyToggle
                bind:checked={notify}
                changeHandler={() => saveInputs() }
                tooltipText={getMsg('optionSearchNotify')}
                data-testid='notify'
            />
        </div>
    {/snippet}

    <fieldset>
        <div class='mb-3 flex justify-between rounded-b text-xs'>
            {#if errorMessage}
                <div class='flex items-center font-bold text-skin-error'>
                    <div class='mr-1 h-4 w-4 flex-shrink-0 text-skin-error'>{@html WarningIcon}</div>
                    <div>{errorMessage}</div>
                </div>
            {/if}
            <div class='mr-4 min-h-[1rem] font-medium text-skin-success'>
                {#if saveMsg && saveMsg !== '...'}
                    <div class='flex items-center'>
                        <div class='mr-1 h-4 w-4 flex-shrink-0'>{@html SaveIcon}</div>
                        <span>{saveMsg}</span>
                    </div>
                {:else}
                    <span>{saveMsg} &nbsp;</span>
                {/if}
            </div>
        </div>

        <div class='mb-2 grid grid-cols-[auto_1fr] items-center gap-2'>
            <label for={ids.name}>{getMsg('optionSearchName')}</label>
            <span class='flex items-center'>
                <input
                    class='w-60 max-w-full'
                    type='text'
                    title={getMsg('optionSearchName_title')}
                    id={ids.name}
                    placeholder={getMsg('optionSearchName_placeholder')}
                    bind:value={name}
                    oninput={inputHandler}
                />
                <span class='ml-2'>
                    <TooltipIcon message={getMsg('optionSearchName_title')} />
                </span>
            </span>

            <label for={ids.subreddit} class='font-bold'>{getMsg('optionSearchSubreddit')}</label>
            <span class='flex items-center'>
                <input
                    class='w-60 max-w-full'
                    type='text'
                    title={getMsg('optionSearchSubreddit_title')}
                    id={ids.subreddit}
                    placeholder={getMsg('optionSearchSubreddit_placeholder')}
                    bind:value={subreddit}
                    bind:this={subredditInputRef}
                    oninput={inputHandler}
                />
                <span class='ml-2'>
                    <TooltipIcon message={getMsg('optionSearchSubreddit_title')} />
                </span>
            </span>

            <label for={ids.query} class='font-bold'>{getMsg('optionSearchQuery')}</label>
            <span class='flex items-center'>
                <input
                    class='w-full'
                    type='text'
                    title={getMsg('optionSearchQuery_title')}
                    placeholder={getMsg('optionSearchQuery_placeholder')}
                    id={ids.query}
                    bind:value={query}
                    oninput={inputHandler}
                />
                <span class='ml-2'>
                    <TooltipIcon message={getMsg('optionSearchQuery_title')} />
                </span>
            </span>

            <div></div>
            <div class='-mt-1'>
                <a
                    class='text-sm underline'
                    href='https://www.reddit.com/wiki/search/#wiki_manual_filtering'
                    target='_blank'
                    rel='noreferrer'
                >
                    {getMsg('optionSearchWiki')}
                </a>
            </div>
        </div>
    </fieldset>
</WatchItem>
