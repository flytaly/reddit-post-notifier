<script lang='ts'>
    import type { HTMLAttributes } from 'svelte/elements';

    let { children, ...attr }: HTMLAttributes<HTMLElement> = $props();
</script>

<div
    class='my-px flex w-full items-center border-b border-t border-skin-bg hover:border-skin-delimiter hover:bg-skin-item-hover focus:border-skin-delimiter focus:bg-skin-item-hover focus-visible:border-skin-outline focus-visible:outline-none'
    {...attr}>
    {@render children?.()}
</div>
