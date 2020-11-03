<script>
    import WatchListRow from './watch-list-row.svelte';
    import { getMsg } from '../../utils';
    import storage from '../../storage';
    import { route, ROUTES } from '../store/route';

    export let subredditList = [];
    export let subreddits = {};
    export let queries = {};
    export let queriesList = [];

    $: subredditList = Object.keys(subreddits)
        .filter((s) => subreddits[s].posts.length)
        .sort((s1, s2) => subreddits[s2].lastPostCreated - subreddits[s1].lastPostCreated);
    $: queriesList = queriesList
        .filter((q) => queries[q.id]?.posts?.length)
        .sort((q1, q2) => queries[q1.id].lastPostCreated - queries[q2.id].lastPostCreated);
</script>

<style>
    main {
        flex: 1 1;
    }

    ul {
        display: flex;
        flex-direction: column;
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .no-posts {
        text-align: center;
        padding: 5px 0;
        color: var(--grey);
    }
</style>

<main>
    {#if subredditList.length || queriesList.length}
        <ul>
            {#each subredditList as subreddit}
                <WatchListRow
                    checkMarkClickHandler={() => storage.removePostsFrom({ subreddit })}
                    clickHandler={() => {
                        route.set({ route: ROUTES.SUBREDDIT_POSTS_LIST, id: subreddit });
                    }}
                    text={`r/${subreddit} (${subreddits[subreddit].posts?.length})`} />
            {/each}
            {#each queriesList as query}
                <WatchListRow
                    checkMarkClickHandler={() => storage.removePostsFrom({ searchId: query.id })}
                    clickHandler={() => {
                        route.set({ route: ROUTES.SEARCH_POSTS_LIST, id: query.id });
                    }}
                    text={`${query.name || query.query} (${queries[query.id].posts?.length})`} />
            {/each}
        </ul>
    {:else}
        <div class="no-posts">{getMsg('noPosts')}</div>
    {/if}
</main>
