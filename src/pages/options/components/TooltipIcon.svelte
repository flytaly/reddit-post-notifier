<script lang='ts'>
    import { onMount } from 'svelte';
    import type { Content } from 'tippy.js';
    import tippy from 'tippy.js';
    import { HelpCircleIcon } from '@options/lib/icons';

    interface Props {
        message: Content;
    }

    let { message }: Props = $props();

    let ref: HTMLElement;

    onMount(() => {
        tippy(ref, {
            content: message,
            allowHTML: true,
            maxWidth: 450,
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
