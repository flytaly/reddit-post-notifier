<script lang='ts'>
    import ArrowUp from '@assets/arrowhead-up.svg?raw';
    import { flip } from 'svelte/animate';
    import { quadOut } from 'svelte/easing';
    import { slide } from 'svelte/transition';
    import { slideHorizontal } from '../helpers/transition';
    import FloatingPreview from './FloatingPreview.svelte';
    import SvgButton from './SvgButton.svelte';
    import type { RedditItem, RedditMessage } from '@/reddit-api/reddit-types';
    import type { Snippet } from 'svelte';

    interface Props {
        toggle?: (e: MouseEvent) => void;
        isExpanded?: boolean;
        rowOutTransition?: typeof slideHorizontal;
        items: RedditItem[] | RedditMessage[];
        headerRow: Snippet;
        listRow: Snippet<[item: RedditItem | RedditMessage]>;
    }

    let {
        toggle = () => {},
        isExpanded = false,
        rowOutTransition = slideHorizontal,
        items,
        headerRow,
        listRow,
    }: Props = $props();

    let containerElement: HTMLElement | undefined = $state();
</script>

<div class='drop-down-list' data-keys-target='list-container' bind:this={containerElement}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class='item' tabindex='0' role='button' onclick={toggle} data-keys-target='list-row'>
        {@render headerRow()}
        <span class='ml-auto mr-3'>
            <SvgButton onclick={toggle}>
                <div class={`transform duration-200 ease-out ${isExpanded ? 'rotate-180' : ''}`}>
                    {@html ArrowUp}
                </div>
            </SvgButton>
        </span>
    </div>
    {#if isExpanded}
        <div class='ml-2 flex flex-row' transition:slide|local={{ duration: 150, easing: quadOut }}>
            <!-- Vertical Line -->
            <button class='group flex w-5 flex-shrink-0' onclick={toggle} aria-label='collapse'>
                <span class='ml-1 h-full w-px bg-skin-delimiter group-hover:w-[2px] group-hover:bg-skin-accent2'></span>
            </button>

            <ul class='flex flex-grow flex-col' data-floatpreview-target='true'>
                {#each items as item (item.data.id)}
                    <li
                        animate:flip={{ delay: 100, duration: 100 }}
                        out:rowOutTransition|local={{ duration: 150, id: item.data.id }}
                    >
                        <div class='item' tabindex='0' role='button' data-keys-target='post-row'>
                            {@render listRow(item)}
                        </div>
                    </li>
                {/each}
            </ul>
        </div>
        {#if containerElement}
            <FloatingPreview posts={items} {containerElement} />
        {/if}
    {/if}
</div>

<style lang='postcss'>
    .drop-down-list {
        @apply flex w-full min-w-[18rem] flex-col;
    }

    .item {
        @apply my-px flex w-full items-center
               border-b border-t border-skin-bg
               hover:border-skin-delimiter hover:bg-skin-item-hover
               focus:border-skin-delimiter focus:bg-skin-item-hover
               focus-visible:border-skin-outline focus-visible:outline-none;
    }
</style>
