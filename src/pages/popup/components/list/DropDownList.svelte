<script lang='ts'>
    import type { RedditItem, RedditMessage } from '@/reddit-api/reddit-types';
    import ArrowUp from '@assets/arrowhead-up.svg?raw';
    import type { Snippet } from 'svelte';
    import { flip } from 'svelte/animate';
    import { quadOut } from 'svelte/easing';
    import { slide } from 'svelte/transition';
    import { slideHorizontal } from '../../helpers/transition';
    import DropDownListItem from './DropDownListItem.svelte';
    import FloatingPreview from '../FloatingPreview.svelte';
    import SvgButton from '../SvgButton.svelte';

    interface Props {
        toggle?: (e: MouseEvent) => void;
        isExpanded?: boolean;
        rowOutTransition?: typeof slideHorizontal;
        items: RedditItem[] | RedditMessage[];
        headerRow: Snippet;
        listRow: Snippet<[item: RedditItem | RedditMessage, colorId: number]>;
        colorVariants?: number;
    }

    let {
        toggle = () => {},
        isExpanded = false,
        rowOutTransition = slideHorizontal,
        items,
        headerRow,
        listRow,
        colorVariants,
    }: Props = $props();

    let containerElement: HTMLElement | undefined = $state();

    // Alternate colors for different consecutive subreddits
    let coloredItems = $derived.by(() => {
        if (!colorVariants) return items.map(item => ({ item: item, colorId: 0 }));
        let current = colorVariants - 1;
        let prevId = '';
        return items.map((item) => {
            const currentId = item.data.subreddit;
            if (currentId !== prevId) {
                current = (current + 1) % colorVariants;
                prevId = currentId || '';
            }
            return { item: item, colorId: current };
        });
    });
</script>

<div class='flex w-full min-w-[18rem] flex-col' data-keys-target='list-container' bind:this={containerElement}>
    <DropDownListItem tabindex={0} role='button' onclick={toggle} data-keys-target='list-row'>
        {@render headerRow()}
        <span class='ml-auto mr-3'>
            <SvgButton onclick={toggle}>
                <div class={[
                    'transform duration-200 ease-out text-skin-text/70',
                    { 'rotate-180': isExpanded }]}>
                    {@html ArrowUp}
                </div>
            </SvgButton>
        </span>
    </DropDownListItem>
    {#if isExpanded}
        <div class='ml-2 flex flex-row' transition:slide|local={{ duration: 150, easing: quadOut }}>
            <!-- Vertical Line -->
            <button class='group flex w-5 flex-shrink-0' onclick={toggle} aria-label='collapse'>
                <span class='ml-1 h-full w-px bg-skin-delimiter group-hover:w-[2px] group-hover:bg-skin-accent2'></span>
            </button>

            <ul class='flex flex-grow flex-col' data-floatpreview-target='true'>
                {#each coloredItems as aItem (aItem.item.data.id)}
                    <li
                        animate:flip={{ delay: 100, duration: 100 }}
                        out:rowOutTransition|local={{ duration: 150, id: aItem.item.data.id }}
                    >
                        <DropDownListItem tabindex={0} role='button' data-keys-target='post-row'>
                            {@render listRow(aItem.item, aItem.colorId)}
                        </DropDownListItem>
                    </li>
                {/each}
            </ul>
        </div>
        {#if containerElement}
            <FloatingPreview posts={items} {containerElement} />
        {/if}
    {/if}
</div>
