<script>
    import { getContext } from 'svelte';
    import { redditUrl, redditOldUrl } from '../../utils';
    import SvgButton from './svg-button.svelte';
    import PinRemove from '../../assets/pin-remove.svg';
    import storage from '../../storage';

    export let post;

    const options = getContext('OPTIONS');
    const baseUrl = options.useOldReddit ? redditOldUrl : redditUrl;

    const onLinkClick = () => {};
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
    .subreddit {
        color: var(--font-color);
        margin-right: 0.5rem;
    }
</style>

<div class="container">
    <a
        class="item-name"
        href={`${baseUrl}${post.data.permalink}`}
        data-keys-target="post-link"
        on:click={onLinkClick}
        data-post-id={post.data.id}>
        <span class="subreddit">{`r/${post.data.subreddit}`}</span>
        <span>{post.data.title}</span>
    </a>
    <span data-keys-target="pin-post">
        <SvgButton
            on:click={() => {
                storage.removePinPost(post.data.id);
            }}
            title={'Remove the post'}>
            {@html PinRemove}
        </SvgButton>
    </span>
</div>
