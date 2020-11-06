<script>
    import { quadOut } from 'svelte/easing';
    import { slide } from 'svelte/transition';
    import { getMsg } from '../../utils';
    import ListRow from './list-row.svelte';
    import storage from '../../storage';
    import FloatPreview from './float-preview.svelte';

    const baseUrl = 'https://reddit.com';

    export let posts = [];
    export let type = 'subreddit'; // 'subreddit' || 'search'
    export let subredditOrSearchId;
    export let shouldCachePosts = false;

    // Save given posts in the cachedPosts array to preserve posts,
    // that was removed from storage.
    const postIds = new Set();
    const readPosts = new Set();
    let cachedPosts = [];

    $: if (shouldCachePosts) {
        cachedPosts = [...posts.filter((p) => !postIds.has(p.data.id)), ...cachedPosts];
        cachedPosts.forEach((p) => postIds.add(p.data.id));
        // if posts in storage are empty it means that user clicked footer button
        if (!posts.length) {
            cachedPosts.forEach((p) => readPosts.add(p.data.id));
        }
    } else {
        cachedPosts = posts;
    }

    let containerRef;

    const clickHandler = async (event) => {
        const li = event.target.closest('li');
        const { id } = li.dataset;
        if (type === 'search') {
            await storage.removePost({ id, searchId: subredditOrSearchId });
        } else {
            await storage.removePost({ id, subreddit: subredditOrSearchId });
        }
        readPosts.add(id);
    };
</script>

<style>
    ul {
        display: flex;
        position: relative;
        flex-direction: column;
        list-style: none;
        padding: 0;
        margin: 0;
    }
    .container {
        width: 100%;
    }
    .item-name {
        flex-grow: 1;
        padding: 4px 2px;
    }
    .read {
        color: var(--grey);
    }
</style>

<div bind:this={containerRef} class="container">
    <ul data-keys-target="list" transition:slide={{ duration: 150, easing: quadOut }}>
        {#each cachedPosts as post (post.data.id)}
            <ListRow
                on:click={clickHandler}
                checkMarkClickHandler={clickHandler}
                title={getMsg('postListCheckMark_title')}
                id={post.data.id}
                keysTarget="post-row">
                <a
                    class="item-name"
                    href={`${baseUrl}${post.data.permalink}`}
                    class:read={readPosts.has(post.data.id)}
                    data-id={post.data.id}>
                    {post.data.title}</a>
            </ListRow>
        {/each}
    </ul>
    {#if containerRef}
        <FloatPreview posts={cachedPosts} containerElement={containerRef} />
    {/if}
</div>
