<script lang="ts">
    import type { RedditItem } from '@/reddit-api/reddit-types';
    import { XCircleIcon } from '../icons';

    export let items: RedditItem[] = [];
    export let title = '';
    export let onClose: () => void = () => {
        //
    };
    export let limit = 5;

    let displayItems: {
        type: string;
        subreddit: string;
        text: string;
        date: string;
        fullDate: string;
        link: string;
        flair?: string;
        author: string;
    }[] = [];

    $: displayItems = items.slice(0, limit).map(({ kind, data }) => {
        const link = 'https://reddit.com/' + data.permalink;
        const date = new Date(data.created * 1000).toLocaleDateString();
        const fullDate = new Date(data.created * 1000).toLocaleString();
        if (kind === 't3')
            return {
                type: 'post',
                subreddit: `r/${data.subreddit}`,
                text: data.title,
                date,
                fullDate,
                link,
                flair: data.link_flair_text,
                author: data.author,
            };
        if (kind === 't1')
            return {
                type: 'comment',
                subreddit: `r/${data.subreddit}`,
                text: data.body,
                date,
                fullDate,
                link,
                flair: '',
                author: data.author,
            };
    });
</script>

<article>
    <header>
        <div class="flex justify-between items-center my-1">
            <div>{title}</div>
            <button class="p-0 mr-2 border-none bg-transparent h-4 w-4" on:click={onClose} title="close">
                {@html XCircleIcon}
            </button>
        </div>
    </header>
    <div class="user-items-grid text-xs">
        {#each displayItems as item}
            <span title={item.fullDate}>{item.date}</span>
            <div>
                <span>{item.type}</span>
                <span>in</span>
                <b class="font-medium">{item.subreddit}</b>
                <span>by</span>
                <b class="font-medium">{item.author}</b>
                <span>: </span>
            </div>
            <a
                class="overflow-hidden whitespace-nowrap overflow-ellipsis break-all  hover:underline"
                href={item.link}
                target="_blank"
            >
                {#if item.flair}
                    <span class="text-skin-text">
                        {`[${String(item.flair || '')}] `}
                    </span>
                {/if}
                {item.text}
            </a>
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
