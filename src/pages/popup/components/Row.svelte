<script lang="ts">
    import type { RedditItem, RedditMessage } from '@/reddit-api/reddit-types';
    import type { PostGroup } from '@/utils/post-group';
    import MessageRow from './MessageRow.svelte';
    import PostRow from './PostRow.svelte';

    export let group: PostGroup;
    export let item: RedditItem | RedditMessage;

    let redditItem: RedditItem;
    let redditMessage: RedditMessage;

    $: if (group.type === 'message' || group.type === 'account-message') {
        redditMessage = item as RedditMessage;
    } else {
        redditItem = item as RedditItem;
    }
</script>

{#if redditItem}
    <PostRow post={redditItem} {group} />
{:else if redditMessage}
    <MessageRow item={redditMessage} {group} />
{/if}
