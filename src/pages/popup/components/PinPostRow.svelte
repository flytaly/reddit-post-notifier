<script lang="ts">
    import { RedditObjectKind } from '@/reddit-api/reddit-types';
    import type { RedditItem, RedditMessage } from '@/reddit-api/reddit-types';
    import storage from '@/storage';
    import { redditOldUrl, redditUrl } from '@/utils';
    import PinRemove from '@assets/pin-remove.svg';
    import { getItemTitle } from '../helpers';
    import { storageData } from '../store/store';
    import SvgButton from './SvgButton.svelte';
    import getMsg from '@/utils/get-message';

    export let item: RedditItem | RedditMessage;

    const baseUrl = $storageData.options.useOldReddit ? redditOldUrl : redditUrl;

    let redditItem: RedditItem;

    if (item.kind !== RedditObjectKind.message) {
        redditItem = item;
    }
</script>

{#if redditItem}
    <div class="flex items-center w-full pr-3 py-1">
        <a
            class="flex-grow px-1"
            href={`${baseUrl}${redditItem.data.permalink}`}
            data-keys-target="post-link"
            data-post-id={redditItem.data.id}
        >
            <span class="text-skin-text pr-2 text-xs">{`r/${redditItem.data.subreddit}`}</span>
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
