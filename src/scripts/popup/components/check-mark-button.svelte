<script>
    import SvgButton from './svg-button.svelte';
    import CheckMark from '../assets/check-mark.svg';

    export let clickHandler = null;
    export let title = null;
</script>

<style>
    .check-mark {
        margin-right: 0.3em;
    }
    .check-mark :global(svg) {
        fill: var(--grey);
    }
    .check-mark:focus :global(svg),
    .check-mark:hover :global(svg) {
        fill: var(--green);
        transform: scale(1.08);
    }
</style>

<span class="check-mark" data-keys-target="check-mark">
    <SvgButton
        on:click={(e) => {
            e.stopPropagation();
            clickHandler(e);
        }}
        {title}>
        {@html CheckMark}
    </SvgButton>
</span>
