<script lang="ts">
    import NotifierApp from '@/notifier/app';
    import type { QueryData, QueryOpts } from '@/storage/storage-types';
    import { debounce, testMultireddit } from '@/utils';
    import getMsg from '@/utils/get-message';
    import { BellIcon, DeleteIcon, RefreshIcon2, WarningIcon } from '@/pages/options/icons';
    import { isBlocked } from '@/pages/options/store';
    import { formatError } from '@options/format-error';
    import Labeled from './Labeled.svelte';
    import RedditItemsList from '@options/components/RedditItemsList.svelte';
    import { searchStore } from './search-store';
    import TooltipIcon from '@options/components/TooltipIcon.svelte';
    import Spinner from '@options/components/common/Spinner.svelte';

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

<fieldset class="border border-skin-base p-2 text-sm" data-testid="search-fieldset">
    <legend class="mb-2 px-1 text-base font-semibold">{getMsg('optionSearchLegend')}</legend>

    <div class="relative mb-2 grid grid-cols-[auto,1fr] items-center gap-2">
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
            <a
                class="text-sm underline"
                href="https://www.reddit.com/wiki/search#wiki_field_search"
                target="_blank"
                rel="noreferrer"
            >
                {getMsg('optionSearchWiki')}
            </a>
        </div>
    </div>

    {#if fetchError}
        <div class="ml-4 flex items-center text-skin-error">
            <div class="mr-1 h-5 w-5">{@html WarningIcon}</div>
            {fetchError}
        </div>
    {/if}

    <div class="mt-2 mb-2 flex items-center justify-between pl-4">
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
            class="ml-auto flex items-center rounded border-transparent  bg-transparent text-skin-accent hover:border-skin-accent hover:bg-skin-input"
            on:click={deleteHandler}
        >
            <div class="mr-2 h-5 w-5 flex-shrink-0">{@html DeleteIcon}</div>
            <div>
                {getMsg('optionSearchDelete')}
            </div>
        </button>
    </div>

    <button
        class="mb-2 ml-4 flex items-center border-transparent bg-transparent  p-0 text-xs text-skin-accent2 transition-colors hover:bg-transparent"
        on:click={() => void fetchPosts()}
        title="click to fetch and show the latest post from the Reddit search"
        disabled={$isBlocked || !queryObject.query || !!subredditError}
    >
        <div class="mr-1 h-5 w-5">
            {@html RefreshIcon2}
        </div>
        <span>{getMsg('optionSearchFetch')}</span>
    </button>

    <Spinner show={isLoading} />

    {#if showPosts}
        <div class="border border-skin-delimiter p-1 ">
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
