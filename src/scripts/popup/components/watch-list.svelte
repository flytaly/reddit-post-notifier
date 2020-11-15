<script>
    import { getContext } from 'svelte';
    import { getSearchQueryUrl, getSubredditUrl } from '../../utils';
    import storage from '../../storage';
    import DropDownList from './drop-down-list.svelte';
    import GroupTitle from './group-title.svelte';
    import PostRow from './post-row.svelte';
    import { getId } from '../pinned-post';
    import { slideVertical, slideHorizontal } from '../transition';

    export let subreddits = {};
    export let queries = {};
    export let queriesList = [];
    export let subredditList = [];
    export let pinnedPostList = [];

    const options = getContext('OPTIONS');
    let groupsWithPosts = [];
    let groupsWithoutPosts = [];
    let expanded = new Set();
    let initialLoading = true;
    let pinContainer;

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

    const getToggleHandler = (id) => () => {
        if (expanded.has(id)) {
            expanded.delete(id);
            expanded = new Set(expanded);
        } else {
            expanded = new Set(expanded.add(id));
        }
    };

    const getGroupItems = (id, type) => {
        if (type === 'subreddit') {
            return subreddits[id].posts;
        }
        if (type === 'search') {
            return queries[id].posts;
        }
        return [];
    };

    const getOnCheckHandler = (id, type) => () => {
        storage.removePostsFrom(type === 'subreddit' ? { subreddit: id } : { searchId: id });
    };

    const pinTransition = (node, props) =>
        props.id && props.id === getId() //
            ? slideVertical(node, pinContainer.getBoundingClientRect().bottom, props)
            : slideHorizontal(node, props);
</script>

<style>
    .big {
        min-height: 300px;
        min-width: 400px;
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
    <!-- PINNED POSTS BLOCK -->
    <div bind:this={pinContainer}>
        {#if pinnedPostList.length}
            <DropDownList
                toggle={getToggleHandler('PINNED_POST_LIST')}
                items={pinnedPostList}
                let:item
                isExpanded={expanded.has('PINNED_POST_LIST')}
                rowOutTransition={pinTransition}>
                <div slot="header-row">
                    <!-- TODO: add component -->
                    Pinned posts
                </div>
                <div slot="list-row">
                    <!-- TODO: add another component for pinned posts that shows subreddit -->
                    <PostRow post={item} />
                </div>
            </DropDownList>
        {/if}
    </div>
    <!-- UNREAD POSTS BLOCK -->
    {#each groupsWithPosts as { type, id, href, title } (id)}
        <div out:slideHorizontal={{ duration: 150 }}>
            <DropDownList
                toggle={getToggleHandler(id)}
                items={getGroupItems(id, type)}
                let:item
                isExpanded={expanded.has(id)}
                rowOutTransition={pinTransition}>
                <div slot="header-row">
                    <GroupTitle onCheck={getOnCheckHandler(id, type)} {href} {title} />
                </div>
                <div slot="list-row">
                    <PostRow post={item} {type} subredditOrSearchId={id} />
                </div>
            </DropDownList>
        </div>
    {/each}
    <!-- EMPTY GROUPS -->
    {#if !options.hideEmptyGroups && groupsWithoutPosts.length}
        <div class="empty-group">empty</div>
        {#each groupsWithoutPosts as { href, title }}
            <GroupTitle {href} {title} />
        {/each}
    {/if}
</div>
