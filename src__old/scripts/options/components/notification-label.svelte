<script>
    import BellIcon from '../../assets/bell.svg';

    export let text = '';
    export let checked = false;
</script>

<style>
    .label-with-svg {
        display: flex;
        align-items: center;
    }
    .label-with-svg :global(svg) {
        margin-right: 0.2rem;
    }
    .checked :global(svg) {
        color: var(--accent-color);
    }
</style>

<span class="label-with-svg" class:checked>
    {@html BellIcon}
    {text}
</span>
