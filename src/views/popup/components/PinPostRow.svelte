<script lang="ts">
    import type { RedditItem } from '@/reddit-api/reddit-types';
    import storage from '@/storage';
    import { redditOldUrl, redditUrl } from '@/utils';
    import PinRemove from '@assets/pin-remove.svg';
    import { getItemTitle } from '../helpers';
    import { storageData } from '../store/store';
    import SvgButton from './SvgButton.svelte';

    export let post: RedditItem;

    const baseUrl = $storageData.options.useOldReddit ? redditOldUrl : redditUrl;
</script>

<div class="flex items-center w-full pr-3 py-1">
    <a
        class="flex-grow px-1"
        href={`${baseUrl}${post.data.permalink}`}
        data-keys-target="post-link"
        data-post-id={post.data.id}
    >
        <span class="text-skin-base pr-2 text-xs">{`r/${post.data.subreddit}`}</span>
        <span>{getItemTitle(post)}</span>
    </a>
    <span data-keys-target="pin-post">
        <SvgButton on:click={() => void storage.removePinPost(post.data.id)} title={'Remove the post'}>
            {@html PinRemove}
        </SvgButton>
    </span>
</div>
