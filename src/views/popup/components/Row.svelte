<script lang="ts">
    import type { RedditItem, RedditMessage } from '@/reddit-api/reddit-types';
    import MessageRow from './MessageRow.svelte';
    import PostRow from './PostRow.svelte';

    export let item: RedditItem | RedditMessage;
    export let itemType: 'subreddit' | 'search' | 'user' | 'message' = 'subreddit';
    export let isMultireddit = false;
    export let id: string;

    type PostType = 'subreddit' | 'search' | 'user';

    let redditItem: RedditItem;
    let redditMessage: RedditMessage;
    let postType: PostType;

    $: if (itemType === 'message') {
        redditMessage = item as RedditMessage;
    } else {
        redditItem = item as RedditItem;
        postType = itemType as PostType;
    }
</script>

{#if redditItem}
    <PostRow showSubreddit={isMultireddit} post={redditItem} type={postType} itemId={id} />
{:else if redditMessage}
    <MessageRow item={redditMessage} accId={id} />
{/if}
