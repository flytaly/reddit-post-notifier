<script lang='ts'>
    import type { RedditItem, RedditMessage } from '@/reddit-api/reddit-types';
    import { RedditObjectKind } from '@/reddit-api/reddit-types';
    import storage from '@/storage';
    import { constructUrl, getItemTitle } from '@/utils';
    import getMsg from '@/utils/get-message';
    import PinRemove from '@assets/pin-remove.svg?raw';
    import { storageData } from '../../store/store';
    import SvgButton from '../SvgButton.svelte';
    import PostLink from './PostLink.svelte';

    interface Props {
        item: RedditItem | RedditMessage;
    }

    let { item }: Props = $props();

    let redditItem = $derived.by(() => {
        if (item.kind && item.kind !== RedditObjectKind.message)
            return item as RedditItem;
    });

    let href: string = $derived(!redditItem ? '' : constructUrl(redditItem.data.permalink, $storageData.options));
</script>

{#if redditItem}
    <div class='flex w-full items-center py-1 pr-3'>
        <PostLink
            class='flex-grow px-1'
            {href}
            postId={redditItem.data.id}
        >
            <span class='pr-2 text-xs text-skin-text'>{`r/${redditItem.data.subreddit}`}</span>
            <span>{getItemTitle(redditItem)}</span>
        </PostLink>
        <span data-keys-target='pin-post'>
            <SvgButton
                onclick={() => void storage.removePinPost(redditItem.data.id)}
                title={getMsg('watchListItemUnpin_title')}
            >
                {@html PinRemove}
            </SvgButton>
        </span>
    </div>
{/if}
