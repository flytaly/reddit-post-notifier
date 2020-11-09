<script>
    import PostList from './post-list.svelte';
    import WatchListRow from './watch-list-row.svelte';
    import { getMsg } from '../../utils';
    import storage from '../../storage';

    export let subreddits = {};
    export let queries = {};
    export let queriesList = [];
    export let expandWithItems = 5;

    let subredditList = [];

    let expanded = new Set();
    let initialLoading = true;

    $: subredditList = Object.keys(subreddits)
        .filter((s) => subreddits[s].posts.length)
        .sort((s1, s2) => subreddits[s2].lastPostCreated - subreddits[s1].lastPostCreated);

    $: queriesList = queriesList
        .filter((q) => queries[q.id]?.posts?.length)
        .sort((q1, q2) => queries[q2.id].lastPostCreated - queries[q1.id].lastPostCreated);

    $: if (initialLoading) {
        expanded = new Set([
            ...expanded,
            ...subredditList.filter((s) => subreddits[s].posts.length <= expandWithItems),
            ...queriesList.filter((q) => queries[q.id].posts.length <= expandWithItems).map((q) => q.id),
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
    .post-list-container {
        display: flex;
        flex-direction: row;
    }
    .line {
        display: flex;
        padding: 0;
        background: none;
        box-shadow: none;
        border: 0;
        width: 2em;
        justify-content: center;
        outline: none;
    }
    .line span {
        width: 1px;
        height: 100%;
        background-color: var(--collapse-line-color);
    }
    .line:hover span,
    .line:focus span {
        width: 2px;
        background-color: var(--collapse-line-hovered-color);
    }
</style>

{#if subredditList.length || queriesList.length}
    <ul data-keys-target="list" class:big>
        {#each subredditList as subreddit (subreddit)}
            <WatchListRow
                checkMarkClickHandler={() => storage.removePostsFrom({ subreddit })}
                on:click={makeClickHandler(subreddit)}
                text={`r/${subreddit} (${subreddits[subreddit].posts?.length})`} />
            {#if expanded.has(subreddit)}
                <li class="post-list-container" data-keys-target="list-container">
                    <button class="line" on:click={makeClickHandler(subreddit)}><span /></button>
                    <PostList posts={subreddits[subreddit].posts} subredditOrSearchId={subreddit} type="subreddit" />
                </li>
            {/if}
        {/each}
        {#each queriesList as query (query.id)}
            <WatchListRow
                checkMarkClickHandler={() => storage.removePostsFrom({ searchId: query.id })}
                on:click={makeClickHandler(query.id)}
                text={`${query.name || query.query} (${queries[query.id].posts?.length})`} />
            {#if expanded.has(query.id)}
                <li class="post-list-container" data-keys-target="list-container">
                    <button class="line" on:click={makeClickHandler(query.id)}><span /></button>
                    <PostList posts={queries[query.id].posts} subredditOrSearchId={query.id} type="search" />
                </li>
            {/if}
        {/each}
    </ul>
{:else}
    <div class="no-posts">{getMsg('noPosts')}</div>
{/if}
