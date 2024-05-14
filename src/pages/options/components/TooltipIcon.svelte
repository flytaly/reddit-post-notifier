<script lang='ts'>
    import { onMount } from 'svelte';
    import type { Content } from 'tippy.js';
    import tippy from 'tippy.js';
    import { HelpCircleIcon } from '@options/lib/icons';

    export let message: Content;

    let ref: HTMLElement;

    onMount(() => {
        tippy(ref, {
            content: message,
        });
    });
</script>

<div bind:this={ref} class='h-4 text-skin-accent2'>
    {@html HelpCircleIcon}
</div>

<style>
    div :global(svg) {
        height: 100%;
    }
</style>
