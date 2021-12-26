<script lang="ts">
    import type { RedditMessage } from '@/reddit-api/reddit-types';
import getMsg from '@/utils/get-message';
    import { XCircleIcon } from '../icons';

    export let items: RedditMessage[] = [];
    export let title = '';
    export let onClose: () => void = undefined;
    export let limit = 5;

    let displayItems: {
        subreddit: string;
        text: string;
        title: string;
        date: string;
        fullDate: string;
        author: string;
    }[] = [];

    $: displayItems = items.slice(0, limit).map(({ data }) => {
        const date = new Date(data.created * 1000).toLocaleDateString();
        const fullDate = new Date(data.created * 1000).toLocaleString();
        return {
            subreddit: data.subreddit,
            title: data.subject,
            text: data.body?.slice(),
            date,
            fullDate,
            author: data.author,
        };
    });
</script>

<article>
    <header>
        <div class="flex justify-between items-center my-1">
            <a href="https://reddit.com/message/unread/" target="_blank">{title}</a>
            <button class="p-0 mr-2 border-none bg-transparent h-4 w-4" on:click={onClose} title={getMsg("closeLabel")}>
                {@html XCircleIcon}
            </button>
        </div>
    </header>
    <div class="user-items-grid text-xs">
        {#each displayItems as item}
            <span title={item.fullDate}>{item.date}</span>
            <div>
                <b class="font-bold">{item.author}</b>
                {#if item.subreddit}
                    <span>(r/{item.subreddit})</span>
                {/if}
                <span>: </span>
            </div>
            <div class="overflow-hidden whitespace-nowrap overflow-ellipsis break-all">
                <span class="font-bold">{item.title}</span>
                <span>: </span>
                <span>{item.text}</span>
            </div>
        {:else}
            <div>No items.</div>
        {/each}
    </div>
</article>

<style lang="postcss">
    .user-items-grid {
        @apply grid gap-x-2 gap-y-0 mt-2;

        grid-template-columns: auto auto 1fr;
    }
</style>
