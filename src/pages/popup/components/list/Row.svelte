<script lang='ts'>
    import type { RedditItem, RedditMessage } from '@/reddit-api/reddit-types';
    import type { PostGroup } from '@/utils/post-group';
    import MessageRow from './MessageRow.svelte';
    import PostRow from './PostRow.svelte';

    interface Props {
        group: PostGroup;
        item: RedditItem | RedditMessage;
        colorId?: number;
    }

    let { group, item, colorId }: Props = $props();

    let row = $derived.by(() => {
        if (group.type === 'message' || group.type === 'account-message')
            return { redditMessage: item as RedditMessage };
        return { redditItem: item as RedditItem };
    });
</script>

{#if row.redditItem}
    <PostRow post={row.redditItem} {group} {colorId} />
{:else if row.redditMessage}
    <MessageRow item={row.redditMessage} {group} />
{/if}
