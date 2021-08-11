<script lang="ts">
    import { onMount } from 'svelte';
    import tippy from 'tippy.js';
    import type { Content } from 'tippy.js';
    import HelpCircle from '../../../assets/help-circle.svg';

    export let message: Content;

    let ref: HTMLElement;

    onMount(() => {
        tippy(ref, {
            content: message,
        });
    });
</script>

<div bind:this={ref} class="h-4 text-skin-accent2">
    {@html HelpCircle}
</div>

<style>
    div :global(svg) {
        height: 100%;
    }
</style>
