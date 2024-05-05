<script lang="ts">
    import { RedditObjectKind } from '@/reddit-api/reddit-types';
    import type { RedditItem, RedditMessage } from '@/reddit-api/reddit-types';
    import storage from '@/storage';
    import { constructUrl, getItemTitle } from '@/utils';
    import PinRemove from '@assets/pin-remove.svg?raw';
    import { storageData } from '../store/store';
    import SvgButton from './SvgButton.svelte';
    import getMsg from '@/utils/get-message';

    export let item: RedditItem | RedditMessage;

    let href: string;
    $: href = constructUrl(redditItem.data.permalink, $storageData.options);

    let redditItem: RedditItem;

    if (item.kind && item.kind !== RedditObjectKind.message) {
        redditItem = item as RedditItem;
    }
</script>

{#if redditItem}
    <div class="flex w-full items-center py-1 pr-3">
        <a class="flex-grow px-1" {href} data-keys-target="post-link" data-post-id={redditItem.data.id}>
            <span class="pr-2 text-xs text-skin-text">{`r/${redditItem.data.subreddit}`}</span>
            <span>{getItemTitle(redditItem)}</span>
        </a>
        <span data-keys-target="pin-post">
            <SvgButton
                on:click={() => void storage.removePinPost(redditItem.data.id)}
                title={getMsg('watchListItemUnpin_title')}
            >
                {@html PinRemove}
            </SvgButton>
        </span>
    </div>
{/if}
