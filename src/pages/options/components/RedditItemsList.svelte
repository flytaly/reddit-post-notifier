<script lang='ts'>
    import { XCircleIcon } from '@options/lib/icons';
    import type { RedditItem } from '@/reddit-api/reddit-types';

    interface Props {
        items?: RedditItem[];
        title?: string;
        onClose?: () => void;
        limit?: number;
    }

    let {
        items = [],
        title = '',
        onClose = () => {},
        limit = 5,
    }: Props = $props();

    type DisplayedRedditItem = {
        type: string;
        subreddit: string;
        text: string;
        date: string;
        fullDate: string;
        link: string;
        flair?: string;
        author: string;
    };

    let displayItems: DisplayedRedditItem[] = $state([]);

    function notEmpty<T>(value: T | null | undefined): value is T {
        return value !== null && value !== undefined;
    }

    $effect(() => {
        displayItems = items
            .slice(0, limit)
            .map(({ kind, data }): DisplayedRedditItem | undefined => {
                const link = `https://reddit.com/${data.permalink}`;
                const date = new Date(data.created * 1000).toLocaleDateString();
                const fullDate = new Date(data.created * 1000).toLocaleString();
                if (kind === 't3') {
                    return {
                        type: 'post',
                        subreddit: `r/${data.subreddit}`,
                        text: data.title,
                        date,
                        fullDate,
                        link,
                        flair: data.link_flair_text || '',
                        author: data.author,
                    };
                }
                if (kind === 't1') {
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
                }
                return undefined;
            })
            .filter(notEmpty);
    });
</script>

<article>
    <header>
        <div class='my-1 flex items-center justify-between'>
            <div>{title}</div>
            <button class='mr-2 h-4 w-4 border-none bg-transparent p-0' onclick={onClose} title='close'>
                {@html XCircleIcon}
            </button>
        </div>
    </header>
    <div class='mt-2 grid gap-x-2 grid-cols-[auto_auto_1fr] gap-y-0 text-xs'>
        {#each displayItems as item}
            <span title={item.fullDate}>{item.date}</span>
            <div>
                <span>{item.type}</span>
                <span>in</span>
                <b class='font-medium'>{item.subreddit}</b>
                <span>by</span>
                <b class='font-medium'>{item.author}</b>
                <span>: </span>
            </div>
            <a
                class='overflow-hidden overflow-ellipsis whitespace-nowrap break-all  hover:underline'
                href={item.link}
                target='_blank'
                rel='noreferrer'
            >
                {#if item.flair}
                    <span class='text-skin-text'>
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
