<script>
    import { onMount } from 'svelte';
    import tippy from 'tippy.js';
    import HelpCircle from '../../assets/help-circle.svg';

    export let message;

    let ref;

    onMount(() => {
        tippy(ref, {
            content: message,
        });
    });
</script>

<style>
    div {
        height: 1.2rem;
    }

    div :global(svg) {
        height: 100%;
        color: var(--accent-color2);
    }
</style>

<div bind:this={ref}>
    {@html HelpCircle}
</div>
