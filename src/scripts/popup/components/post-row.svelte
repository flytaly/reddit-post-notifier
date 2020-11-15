<script>
    import { getMsg } from '../../utils';
    import SvgButton from './svg-button.svelte';
    import CheckMarkButton from './check-mark-button.svelte';
    import Pin from '../assets/pin-outline.svg';
    import storage from '../../storage';
    import { setId } from '../pinned-post';

    export let post = {};
    export let type = 'subreddit';
    export let subredditOrSearchId;

    const baseUrl = 'https://reddit.com';

    let pinnedPost = null;

    const removePost = async (id) => {
        if (type === 'search') {
            await storage.removePost({ id, searchId: subredditOrSearchId });
        } else {
            await storage.removePost({ id, subreddit: subredditOrSearchId });
        }
    };

    const onPin = async (ev) => {
        ev.stopPropagation();
        pinnedPost = post;
        setId(post.data.id);
        await storage.savePinnedPost(post);
        return removePost(post.data.id);
    };
</script>

<style>
    .container {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 0.15rem 0.8rem 0.15rem 0;
    }
    .item-name {
        flex-grow: 1;
        padding: 0.2em 0.2rem;
    }
    .item-name :global(svg path) {
        fill: var(--link-color);
        fill-opacity: 0.5;
    }
    .item-name :global(a:hover svg path) {
        fill-opacity: 1;
    }
</style>

<div class="container" data-post-id={post.data.id}>
    <CheckMarkButton clickHandler={() => removePost(post.data.id)} title={getMsg('postListCheckMark_title')} />
    <a class="item-name" href={`${baseUrl}${post.data.permalink}`} data-id={post.data.id}> {post.data.title}</a>
    <SvgButton on:click={onPin} title={'Pin the post'}>
        {@html Pin}
    </SvgButton>
</div>
