<script>
    import { getMsg, debounce, subredditNameRegExp } from '../../utils';
    import TooltipIcon from './tooltip-icon.svelte';
    import LabelContainer from './label-container.svelte';
    import NotificationLabel from './notification-label.svelte';
    import storage from '../../storage';

    export let queryObject;
    export let onDelete;
    export let error = null;

    const { id } = queryObject;
    let { notify = false, name = '', query = '', subreddit = '' } = queryObject;

    let subredditInputRef;
    let saveMsg = '';

    const ids = {
        name: `search_name_${id}`,
        subreddit: `search_subreddit_${id}`,
        query: `search_query_${id}`,
    };

    const checkSubreddits = (subs) => subs.split('+').every((s) => subredditNameRegExp.test(s));

    const saveInputs = debounce(async () => {
        const _query = query.trim();
        if (!_query) return;

        const _subreddit = subreddit.trim().replace(/\s/g, '+');
        if (_subreddit && !checkSubreddits(_subreddit)) {
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

<style>
    fieldset {
        border: 1px solid var(--border-color);
    }
    legend {
        font-weight: bold;
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
    }
    .grid {
        position: relative;
        display: grid;
        grid-template-columns: auto 1fr;
        align-items: center;
        column-gap: 0.6rem;
    }

    .input-with-tooltip input {
        width: 15rem;
        max-width: 100%;
    }
    .input-with-tooltip {
        display: flex;
        align-items: center;
        margin-top: 0.5rem;
    }

    .tooltip {
        margin-left: 0.5rem;
    }
    button.delete {
        margin-top: 1rem;
        color: var(--accent-color);
        border-color: var(--accent-color);
    }
    .saved-notificaton {
        position: absolute;
        right: 0.5rem;
        top: 1rem;
    }
    .saved {
        color: var(--success-color);
    }
</style>

<fieldset>
    <legend>{getMsg('optionSearchLegend')}</legend>

    <div class="grid">
        <div class="saved-notificaton" class:saved={saveMsg === 'saved'}>{saveMsg}</div>
        <label for={ids.name}>{getMsg('optionSearchName')}</label>
        <span class="input-with-tooltip">
            <input
                type="text"
                title={getMsg('optionSearchName_title')}
                id={ids.name}
                placeholder={getMsg('optionSearchName_placeholder')}
                bind:value={name}
                on:input={inputHandler} />
            <span class="tooltip">
                <TooltipIcon message={getMsg('optionSearchName_title')} />
            </span>
        </span>

        <label for={ids.subreddit}>{getMsg('optionSearchSubreddit')}</label>
        <span class="input-with-tooltip">
            <input
                type="text"
                title={getMsg('optionSearchSubreddit_title')}
                id={ids.subreddit}
                placeholder={getMsg('optionSearchSubreddit_placeholder')}
                bind:value={subreddit}
                bind:this={subredditInputRef}
                on:input={inputHandler} />
            <span class="tooltip">
                <TooltipIcon message={getMsg('optionSearchSubreddit_title')} />
            </span>
        </span>

        <label for={ids.query}>{getMsg('optionSearchQuery')}</label>
        <span class="input-with-tooltip">
            <input
                type="text"
                style="width:100%"
                title={getMsg('optionSearchQuery_title')}
                placeholder={getMsg('optionSearchQuery_placeholder')}
                id={ids.query}
                bind:value={query}
                on:input={inputHandler} />
            <span class="tooltip">
                <TooltipIcon message={getMsg('optionSearchQuery_title')} />
            </span>
        </span>

        <div />
        <div>
            <a
                href="https://www.reddit.com/wiki/search#wiki_field_search"
                target="_blank">{getMsg('optionSearchWiki')}</a>
        </div>

        {#if error}
            <div />
            <div class="error">{`Error during last fetch: ${error.error} ${error.message}`}</div>
        {/if}
    </div>

    <LabelContainer indent>
        <input slot="input" type="checkbox" bind:checked={notify} on:change={inputHandler} />
        <span slot="description">
            <NotificationLabel checked={notify} text={getMsg('optionSearchNotify')} />
        </span>
    </LabelContainer>

    <button class="delete" on:click={deleteHandler}>{getMsg('optionSearchDelete')}</button>
</fieldset>
