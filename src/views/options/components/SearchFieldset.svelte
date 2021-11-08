<script lang="ts">
    import type { RedditError } from '@/reddit-api/reddit-types';
    import storage from '@/storage';
    import type { QueryOpts } from '@/storage/storage-types';
    import { debounce, testMultireddit } from '@/utils';
    import getMsg from '@/utils/get-message';
    import { BellIcon, DeleteIcon, NotifyIcon, NotifyOffIcon } from '@/views/options/icons';
    import Labeled from './Labeled.svelte';
    import TooltipIcon from './TooltipIcon.svelte';

    export let queryObject: QueryOpts;
    export let onDelete: (id: string) => unknown;
    export let error: RedditError | null = null;

    const { id } = queryObject;
    let { notify = false, name = '', query = '', subreddit = '' } = queryObject;

    let subredditInputRef: HTMLInputElement;
    let saveMsg = '';

    const ids = {
        name: `search_name_${id}`,
        subreddit: `search_subreddit_${id}`,
        query: `search_query_${id}`,
    };

    const saveInputs = debounce(async () => {
        const _query = query.trim();
        if (!_query) return;

        const _subreddit = subreddit.trim().replace(/\s/g, '+');
        if (_subreddit && !testMultireddit(_subreddit)) {
            subredditInputRef.setCustomValidity(`Invalid subreddit names`);
            return;
        }
        subredditInputRef.setCustomValidity('');
        await storage.saveQuery({ id, name: name.trim(), subreddit: _subreddit, query: _query, notify });
        saveMsg = 'saved';
    }, 400);

    const inputHandler = () => {
        saveMsg = '...';
        saveInputs();
    };

    const deleteHandler = async () => {
        await storage.removeQueries([id]);
        if (onDelete) onDelete(id);
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
                bind:value={name}
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
                bind:value={subreddit}
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
                bind:value={query}
                on:input={inputHandler}
            />
            <span class="ml-2">
                <TooltipIcon message={getMsg('optionSearchQuery_title')} />
            </span>
        </span>

        <div />
        <div class="-mt-1">
            <a
                class="text-skin-link underline text-sm"
                href="https://www.reddit.com/wiki/search#wiki_field_search"
                target="_blank">{getMsg('optionSearchWiki')}</a
            >
        </div>

        {#if error}
            <div />
            <div class="text-skin-error">{`Error during the latest fetch: ${error.error} ${error.message}`}</div>
        {/if}
    </div>

    <div class="flex justify-between items-center mt-4 pl-4">
        <Labeled>
            <input slot="input" type="checkbox" bind:checked={notify} on:change={inputHandler} />
            <span slot="description">
                <div class="flex items-center">
                    <span class={`h-4 w-4 mr-2 flex-shrink-0 ${notify ? 'text-skin-accent' : 'text-skin-base'}`}>
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
</fieldset>
