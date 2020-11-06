<script>
    import { slidehorizontal } from '../slide-transition';
    import SvgButton from './svg-button.svelte';
    import CheckMark from '../assets/check-mark.svg';

    export let checkMarkClickHandler = null;
    export let title = '';
    export let id = null;
</script>

<style>
    li {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 0 4px;
        border-top: 1px solid var(--main-bg-color);
        border-bottom: 1px solid var(--main-bg-color);
    }

    li:focus,
    li:hover {
        background-color: var(--hover-bg-color);
        border-top: 1px solid var(--hover-border-color);
        border-bottom: 1px solid var(--hover-border-color);
        outline: none;
    }
    .check-mark :global(svg) {
        fill: var(--grey);
    }
    li:focus .check-mark :global(svg),
    .check-mark:focus :global(svg),
    .check-mark:hover :global(svg) {
        fill: var(--green);
        transform: scale(1.08);
    }
</style>

<li tabindex="0" on:click data-id={id} data-keys-target="list-row" out:slidehorizontal={{ duration: 150 }}>
    <span class="check-mark" data-keys-target="check-mark">
        <SvgButton
            on:click={(e) => {
                e.stopPropagation();
                checkMarkClickHandler(e);
            }}
            {title}>
            {@html CheckMark}
        </SvgButton>
    </span>
    <slot />
</li>
