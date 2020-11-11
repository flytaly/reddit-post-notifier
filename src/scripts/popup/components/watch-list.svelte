<script>
    import { getContext } from 'svelte';
    import WatchListRow from './watch-list-row.svelte';
    import { getMsg, getSearchQueryUrl, getSubredditUrl } from '../../utils';
    import storage from '../../storage';

    export let subreddits = {};
    export let queries = {};
    export let queriesList = [];
    export let subredditList = [];

    const options = getContext('OPTIONS');

    let expanded = new Set();
    let initialLoading = true;

    $: subredditList = subredditList
        .filter((s) => subreddits[s]?.posts?.length)
        .sort((s1, s2) => subreddits[s2].lastPostCreated - subreddits[s1].lastPostCreated);

    $: queriesList = queriesList
        .filter((q) => queries[q.id]?.posts?.length)
        .sort((q1, q2) => queries[q2.id].lastPostCreated - queries[q1.id].lastPostCreated);

    $: if (initialLoading) {
        expanded = new Set([
            ...expanded,
            ...subredditList.filter((s) => subreddits[s].posts.length <= options.expandWithItems),
            ...queriesList.filter((q) => queries[q.id].posts.length <= options.expandWithItems).map((q) => q.id),
        ]);
        if (expanded.size) initialLoading = false;
    }
    $: if (subredditList.length + queriesList.length === 1) {
        expanded = new Set([...subredditList, ...queriesList.map((q) => q.id)]);
    }

    let big = false;
    $: big = big || Boolean(expanded.size);

    const makeClickHandler = (id) => () => {
        if (expanded.has(id)) {
            expanded.delete(id);
            expanded = new Set(expanded);
        } else {
            expanded = new Set(expanded.add(id));
        }
    };
</script>

<style>
    ul {
        display: flex;
        flex-direction: column;
        list-style: none;
        padding: 0;
        margin: 0;
        min-width: 200px;
        max-width: 500px;
    }
    .big {
        min-height: 300px;
        min-width: 400px;
    }
    .no-posts {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--grey);
        padding: 5px 0;
        height: 100%;
        min-width: 200px;
    }
</style>

{#if subredditList.length || queriesList.length}
    <ul data-keys-target="list" class:big>
        {#each subredditList as subreddit (subreddit)}
            <WatchListRow
                checkMarkClickHandler={() => storage.removePostsFrom({ subreddit })}
                href={getSubredditUrl(subreddit)}
                on:click={makeClickHandler(subreddit)}
                text={`r/${subreddit} (${subreddits[subreddit].posts?.length})`}
                isExpanded={expanded.has(subreddit)}
                subredditOrSearchId={subreddit}
                type="subreddit" />
        {/each}
        {#each queriesList as query (query.id)}
            <WatchListRow
                checkMarkClickHandler={() => storage.removePostsFrom({ searchId: query.id })}
                href={getSearchQueryUrl(query.query, query.subreddit)}
                on:click={makeClickHandler(query.id)}
                text={`${query.name || query.query} (${queries[query.id].posts?.length})`}
                isExpanded={expanded.has(query.id)}
                subredditOrSearchId={query.id}
                type="search" />
        {/each}
    </ul>
{:else}
    <div class="no-posts">{getMsg('noPosts')}</div>
{/if}
