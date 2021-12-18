<script lang="ts">
    import NotifierApp from '@/notifier/app';
    import type { QueryData, QueryOpts } from '@/storage/storage-types';
    import { debounce, testMultireddit } from '@/utils';
    import getMsg from '@/utils/get-message';
    import { BellIcon, DeleteIcon, LoadingIcon, RefreshIcon2, WarningIcon } from '@/views/options/icons';
    import { isBlocked } from '@/views/options/store';
    import { formatError } from '../../format-error';
    import Labeled from '../Labeled.svelte';
    import RedditItemsList from '../RedditItemsList.svelte';
    import { searchStore } from './search-store';
    import TooltipIcon from '../TooltipIcon.svelte';

    export let queryObject: QueryOpts;
    export let queryData: QueryData;

    let subredditInputRef: HTMLInputElement;
    let isLoading = false;
    let showPosts = false;
    let saveMsg = '';

    let subredditError = '';
    let fetchError = 'err';
    $: fetchError = formatError(queryData.error);

    let { id } = queryObject;
    $: id = queryObject.id;

    const ids = {
        name: `search_name_${id}`,
        subreddit: `search_subreddit_${id}`,
        query: `search_query_${id}`,
    };

    const saveInputs = debounce(async () => {
        const _query = queryObject.query?.trim();
        if (!_query) return;
        fetchError = '';
        subredditError = '';
        showPosts = false;
        const _subreddit = queryObject.subreddit?.trim().replace(/\s/g, '+');
        if (_subreddit && !testMultireddit(_subreddit)) {
            const msg = 'Invalid subreddit name';
            subredditInputRef.setCustomValidity(msg);
            subredditError = msg;
            return;
        }
        subredditInputRef.setCustomValidity('');

        await searchStore.saveQuery({
            ...queryObject,
            name: queryObject.name?.trim(),
            subreddit: _subreddit,
            query: _query,
        });
        saveMsg = 'saved';
    }, 400);

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
            await app.updateQuery({
                query: queryObject,
                queryData: { ...queryData, lastPostCreated: 0, posts: [], error: null },
            });
        } catch (e: unknown) {
            fetchError = (e as { message?: string }).message || '';
        }
        isLoading = false;
        showPosts = true;
    };
</script>

<fieldset class="border border-skin-base text-sm p-2" data-testid="search-fieldset">
    <legend class="font-semibold text-base mb-2 px-1">{getMsg('optionSearchLegend')}</legend>

    <div class="relative grid items-center gap-2 grid-cols-[auto,1fr] mb-2">
        <div class="absolute right-2 top-4 text-skin-success">{saveMsg}</div>
        <label for={ids.name}>{getMsg('optionSearchName')}</label>
        <span class="flex items-center">
            <input
                class="w-60 max-w-full"
                type="text"
                title={getMsg('optionSearchName_title')}
                id={ids.name}
                placeholder={getMsg('optionSearchName_placeholder')}
                bind:value={queryObject.name}
                on:input={inputHandler}
            />
            <span class="ml-2">
                <TooltipIcon message={getMsg('optionSearchName_title')} />
            </span>
        </span>

        <label for={ids.subreddit}>{getMsg('optionSearchSubreddit')}</label>
        <span class="flex items-center">
            <input
                class="w-60 max-w-full"
                type="text"
                title={getMsg('optionSearchSubreddit_title')}
                id={ids.subreddit}
                placeholder={getMsg('optionSearchSubreddit_placeholder')}
                bind:value={queryObject.subreddit}
                bind:this={subredditInputRef}
                on:input={inputHandler}
            />
            <span class="ml-2">
                <TooltipIcon message={getMsg('optionSearchSubreddit_title')} />
            </span>
        </span>

        <label for={ids.query}>{getMsg('optionSearchQuery')}</label>
        <span class="flex items-center">
            <input
                class="w-full"
                type="text"
                title={getMsg('optionSearchQuery_title')}
                placeholder={getMsg('optionSearchQuery_placeholder')}
                id={ids.query}
                bind:value={queryObject.query}
                on:input={inputHandler}
            />
            <span class="ml-2">
                <TooltipIcon message={getMsg('optionSearchQuery_title')} />
            </span>
        </span>

        <div />
        <div class="-mt-1">
            <a class="underline text-sm" href="https://www.reddit.com/wiki/search#wiki_field_search" target="_blank"
                >{getMsg('optionSearchWiki')}</a
            >
        </div>
    </div>

    {#if fetchError}
        <div class="flex items-center ml-4 text-skin-error">
            <div class="w-5 h-5 mr-1">{@html WarningIcon}</div>
            {fetchError}
        </div>
    {/if}

    <div class="flex justify-between items-center mt-2 mb-2 pl-4">
        <Labeled>
            <input slot="input" type="checkbox" bind:checked={queryObject.notify} on:change={inputHandler} />
            <span slot="description">
                <div class="flex items-center">
                    <span
                        class={`h-4 w-4 mr-2 flex-shrink-0 ${
                            queryObject.notify ? 'text-skin-accent' : 'text-skin-text'
                        }`}
                    >
                        {@html BellIcon}
                    </span>
                    {getMsg('optionSearchNotify')}
                </div>
            </span>
        </Labeled>
        <button
            class="flex items-center rounded ml-auto text-skin-accent  border-transparent hover:border-skin-accent bg-transparent hover:bg-skin-input"
            on:click={deleteHandler}
        >
            <div class="w-5 h-5 mr-2 flex-shrink-0">{@html DeleteIcon}</div>
            <div>
                {getMsg('optionSearchDelete')}
            </div>
        </button>
    </div>

    <button
        class="flex items-center text-skin-accent2 p-0 ml-4  border-transparent bg-transparent hover:bg-transparent text-xs transition-colors"
        on:click={() => void fetchPosts()}
        title="click to fetch and show the latest post from the Reddit search"
        disabled={$isBlocked || !queryObject.query || !!subredditError}
    >
        <div class="w-5 h-5 mr-1">
            {@html RefreshIcon2}
        </div>
        <span>fetch and display the latest posts</span>
    </button>

    {#if isLoading}
        <div class="flex space-x-1 mt-2">
            <div class="w-4 h-4 animate-spin" title="loading">{@html LoadingIcon}</div>
            <span>Loading</span>
        </div>
    {/if}

    {#if showPosts}
        <div class="border p-1 border-skin-delimiter ">
            <RedditItemsList
                title={`The latest posts in the search.`}
                items={queryData.posts || []}
                limit={8}
                onClose={() => {
                    showPosts = false;
                }}
            />
        </div>
    {/if}
</fieldset>
