<script>
    import MainBlockRow from './main-block-row.svelte';
    import { getMsg } from '../../utils';
    import storage from '../../storage';

    export let subredditList = [];
    export let subreddits = {};
    export let queries = {};
    export let queriesList = [];

    $: subredditList = Object.keys(subreddits)
        .filter((s) => subreddits[s].posts.length)
        .sort((s1, s2) => subreddits[s2].lastPostCreated - subreddits[s1].lastPostCreated);
    $: queriesList = queriesList.sort((q1, q2) => queries[q1].lastPostCreated - queries[q2].lastPostCreated);
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
                <MainBlockRow
                    checkMarkClickHandler={() => storage.removePostsFrom({ subreddit })}
                    clickHandler={() => console.log('move to posts list')}
                    text={`r/${subreddit} (${subreddits[subreddit].posts?.length})`} />
            {/each}
            {#each queriesList as query}
                <MainBlockRow
                    checkMarkClickHandler={() => storage.removePostsFrom({ searchId: query.id })}
                    clickHandler={() => console.log('move to posts list')}
                    text={`${query.name || query.query} (${queries[query.id].posts?.length})`} />
            {/each}
        </ul>
    {:else}
        <div class="no-posts">{getMsg('noPosts')}</div>
    {/if}
</main>
