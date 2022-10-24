<script lang="ts">
    import NotifierApp from '@/notifier/app';
    import type { QueryData, QueryOpts } from '@/storage/storage-types';
    import { debounce, testMultireddit } from '@/utils';
    import getMsg from '@/utils/get-message';
    import { SaveIcon, WarningIcon } from '@/pages/options/icons';
    import { isBlocked } from '@/pages/options/store';
    import { formatError } from '@options/format-error';
    import RedditItemsList from '@options/components/RedditItemsList.svelte';
    import { searchStore } from './search-store';
    import TooltipIcon from '@options/components/TooltipIcon.svelte';
    import Spinner from '@options/components/common/Spinner.svelte';
    import WatchItem from '../WatchItem.svelte';
    import NotifyToggle from '@options/components/common/NotifyToggle.svelte';

    export let queryObject: QueryOpts;
    export let queryData: QueryData;

    let subredditInputRef: HTMLInputElement;
    let isLoading = false;
    let showPosts = false;
    let saveMsg = '';
    let name = '';

    let isActive = !queryObject.disabled;
    let showEditBlock = false;

    let errorMessage = '';
    let subredditError = '';
    let fetchError = '';
    $: fetchError = formatError(queryData.error);
    $: errorMessage = subredditError || fetchError;

    $: if (!queryObject.name && !queryObject.query && !showEditBlock) {
        name = 'click here to edit...';
    } else {
        name = queryObject.name || queryObject.query || '';
    }

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
            subredditInputRef?.setCustomValidity(msg);
            subredditError = msg;
            return;
        }

        subredditInputRef?.setCustomValidity('');

        await searchStore.saveQuery({
            ...queryObject,
            name: queryObject.name?.trim(),
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

<WatchItem
    bind:showEditBlock
    bind:isActive
    name={name || showEditBlock ? name : 'click here to edit...'}
    onActiveToggle={() => void saveInputs()}
    onDelete={deleteHandler}
    onFetch={() => void fetchPosts()}
    disabled={$isBlocked || !queryObject.query || !!subredditError}
    data-testid="search-inputs"
    {errorMessage}
>
    <div slot="posts-block">
        <!-- Post list row -->
        <div class="col-span-full">
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
        </div>
    </div>

    <div slot="toggles" class="flex gap-3">
        <NotifyToggle
            bind:checked={queryObject.notify}
            changeHander={() => saveInputs()}
            tooltipText={getMsg('optionSearchNotify')}
            data-testid="notify"
        />
    </div>

    <fieldset>
        <div class="mb-3 flex justify-between rounded-b text-xs">
            {#if errorMessage}
                <div class="flex items-center font-bold text-skin-error">
                    <div class="mr-1 h-4 w-4 flex-shrink-0 text-skin-error">{@html WarningIcon}</div>
                    <div>{errorMessage}</div>
                </div>
            {/if}
            <div class="mr-4 min-h-[1rem] font-medium text-skin-success">
                {#if saveMsg && saveMsg != '...'}
                    <div class="flex items-center">
                        <div class="mr-1 h-4 w-4 flex-shrink-0">{@html SaveIcon}</div>
                        <span>{saveMsg}</span>
                    </div>
                {:else}
                    <span>{saveMsg} &nbsp;</span>
                {/if}
            </div>
        </div>

        <div class="mb-2 grid grid-cols-[auto,1fr] items-center gap-2">
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

            <label for={ids.subreddit} class="font-bold">{getMsg('optionSearchSubreddit')}</label>
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

            <label for={ids.query} class="font-bold">{getMsg('optionSearchQuery')}</label>
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
    </fieldset>
</WatchItem>
