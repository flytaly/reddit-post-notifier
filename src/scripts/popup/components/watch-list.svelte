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
    let groupsWithPosts = [];
    let groupsWithoutPosts = [];

    let expanded = new Set();
    let initialLoading = true;

    $: {
        groupsWithPosts = [];
        groupsWithoutPosts = [];
        subredditList.forEach((s) => {
            const length = subreddits[s]?.posts?.length || 0;
            const lastPostCreated = subreddits[s]?.lastPostCreated;
            const group = {
                type: 'subreddit',
                id: s,
                href: getSubredditUrl(s),
                title: `r/${s} (${length})`,
                lastPostCreated,
                size: length,
            };
            if (length) {
                groupsWithPosts.push(group);
            } else if (!options.hideEmptyGroups) {
                groupsWithoutPosts.push(group);
            }
        });

        queriesList.forEach((q) => {
            const length = queries[q.id]?.posts?.length || 0;
            const lastPostCreated = queries[q.id]?.lastPostCreated;
            const group = {
                type: 'search',
                id: q.id,
                href: getSearchQueryUrl(q.query, q.subreddit),
                title: `${q.name || q.query} (${length})`,
                lastPostCreated,
                size: length,
            };
            if (length) {
                groupsWithPosts.push(group);
            } else if (!options.hideEmptyGroups) {
                groupsWithoutPosts.push(group);
            }
        });
        groupsWithPosts.sort((a, b) => a.lastPostCreated - b.lastPostCreated);
    }

    $: if (initialLoading) {
        if (groupsWithPosts.length === 1) {
            expanded = new Set(groupsWithPosts.map((g) => g.id));
        } else {
            expanded = new Set([
                ...expanded,
                ...groupsWithPosts.filter((g) => g.size <= options.expandWithItems).map((g) => g.id),
            ]);
        }
        if (expanded.size) initialLoading = false;
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
    .container {
        display: flex;
        flex-direction: column;
    }
    .empty-group {
        color: var(--disable);
        align-self: center;
        text-align: center;
        width: 100%;
        border-top: 1px dashed var(--disable);
        margin-top: 1em;
    }
</style>

<div class="container" class:big>
    {#if subredditList.length || queriesList.length}
        <ul data-keys-target="list">
            {#each groupsWithPosts as { type, id, href, title } (id)}
                <WatchListRow
                    checkMarkClickHandler={() => storage.removePostsFrom(type === 'subreddit' ? { subreddit: id } : { searchId: id })}
                    on:click={makeClickHandler(id)}
                    isExpanded={expanded.has(id)}
                    subredditOrSearchId={id}
                    text={title}
                    {href}
                    {type} />
            {/each}
        </ul>
        {#if !options.hideEmptyGroups}
            <div class="empty-group">empty</div>
            <ul>
                {#each groupsWithoutPosts as { type, id, href, title } (id)}
                    <WatchListRow isExpanded={false} subredditOrSearchId={id} text={title} {href} {type} isEmpty />
                {/each}
            </ul>
        {/if}
    {:else}
        <div class="no-posts">{getMsg('noPosts')}</div>
    {/if}
</div>
