<script>
    import { flip } from 'svelte/animate';
    import { quadOut } from 'svelte/easing';
    import { slide } from 'svelte/transition';
    import ArrowUp from '../assets/arrowhead-up.svg';
    import { slideHorizontal } from '../transition';
    import SvgButton from './svg-button.svelte';
    import FloatPreview from './float-preview.svelte';

    export let items;
    export let rowOutTransition = slideHorizontal;
    export let isExpanded = false; // initial state
    export let toggle; // initial state

    let containerElement;
</script>

<style>
    .drop-down-list {
        display: flex;
        flex-direction: column;
        width: 100%;
        padding: 0;
        margin: 0;
        min-width: 200px;
        max-width: 500px;
    }

    .item {
        display: flex;
        align-items: center;
        width: 100%;
        border-top: 1px solid var(--main-bg-color);
        border-bottom: 1px solid var(--main-bg-color);
    }

    .item:hover,
    .item:focus {
        background-color: var(--hover-bg-color);
        border-top: 1px solid var(--hover-border-color);
        border-bottom: 1px solid var(--hover-border-color);
        outline: none;
    }

    .collapsible {
        display: flex;
        flex-direction: row;
        margin-left: 0.5rem;
    }
    .items {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        list-style: none;
        padding: 0;
        margin: 0;
    }
    .line {
        display: flex;
        padding: 0;
        background: none;
        box-shadow: none;
        border: 0;
        min-width: 1.3rem;
        width: 1.3rem;
        justify-content: center;
        outline: none;
    }
    .line span {
        width: 1px;
        height: 100%;
        background-color: var(--collapse-line-color);
    }
    .line:hover span,
    .line:focus span {
        width: 2px;
        background-color: var(--collapse-line-hovered-color);
    }
    .arrow {
        margin-left: auto;
        margin-right: 0.6rem;
    }
    .arrow :global(svg) {
        transition: transform 200ms ease-out;
    }
    .arrow.isExpanded :global(svg),
    .arrow.isExpanded :global(svg):hover {
        transform: rotate(180deg);
    }

    :global([slot='list-row']),
    :global([slot='header-row']) {
        flex-grow: 1;
    }
</style>

<div class="drop-down-list" data-keys-target="list-container" bind:this={containerElement}>
    <div class="item" tabindex="0" on:click={toggle} data-keys-target="list-row">
        <slot name="header-row" />
        <span class="arrow" class:isExpanded>
            <SvgButton on:click={toggle}>
                {@html ArrowUp}
            </SvgButton>
        </span>
    </div>
    {#if isExpanded}
        <div
            class="collapsible"
            transition:slide={{ duration: 150, easing: quadOut }}
            on:introstart={() => {
                // to prevent scroll bar blinking
                document.body.style.overflowY = 'hidden';
            }}
            on:introend={() => {
                document.body.style.overflowY = '';
            }}>
            <button class="line" on:click={toggle}><span /></button>
            <ul class="items" data-floatpreview-target="true">
                {#each items as item (item.data.id)}
                    <li
                        class="item"
                        tabindex="0"
                        data-keys-target="post-row"
                        out:rowOutTransition|local={{ duration: 150, id: item.data.id }}
                        animate:flip={{ delay: 100, duration: 100 }}>
                        <slot name="list-row" {item} />
                    </li>
                {/each}
            </ul>
        </div>
        {#if containerElement}
            <FloatPreview posts={items} {containerElement} />
        {/if}
    {/if}
    <!-- to fix warning: https://github.com/sveltejs/svelte/issues/4546 -->
    <slot />
</div>
