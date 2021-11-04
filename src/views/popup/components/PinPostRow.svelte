<script lang="ts">
    import { redditUrl, redditOldUrl } from '@/utils';
    import SvgButton from './SvgButton.svelte';
    import PinRemove from '@assets/pin-remove.svg';
    import storage from '@/storage';
    import { storageData } from '../store/store';
    import type { RedditPost } from '@/reddit-api/reddit-types';

    export let post: RedditPost;

    const baseUrl = $storageData.options.useOldReddit ? redditOldUrl : redditUrl;
</script>

<div class="flex items-center w-full pr-3 py-1">
    <a
        class="flex-grow px-1"
        href={`${baseUrl}${post.data.permalink}`}
        data-keys-target="post-link"
        data-post-id={post.data.id}
    >
        <span class="text-skin-base pr-2">{`r/${post.data.subreddit}`}</span>
        <span>{post.data.title}</span>
    </a>
    <span data-keys-target="pin-post">
        <SvgButton on:click={() => void storage.removePinPost(post.data.id)} title={'Remove the post'}>
            {@html PinRemove}
        </SvgButton>
    </span>
</div>
