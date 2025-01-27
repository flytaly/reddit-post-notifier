<script lang='ts'>
    import type { HTMLAttributes } from 'svelte/elements';

    interface Props extends HTMLAttributes<HTMLButtonElement | HTMLAnchorElement> {
        href?: string | null;
        disabled?: boolean;
        text?: string;
        w?: string;
        h?: string;
        children?: import('svelte').Snippet;
    }

    let {
        href = null,
        text = '',
        w = '1rem',
        h = w,
        children,
        ...rest
    }: Props = $props();

    let iconStyles = $derived(`width:${w};height:${h};`);
    let tag = $derived(href ? 'a' : 'button');
    let attr = $derived(href ? { href, ...rest } : rest);
</script>

<svelte:element this={tag}
    class= {[
        'flex items-center justify-center p-0 transition disabled:text-skin-gray2 group',
        { 'px-1 ring-skin-delimiter hover:bg-skin-btn hover:ring-1 active:brightness-110': text },
    ]}
    {...attr}>
    <div class='group-hover:scale-110 group-active:scale-95 group-disabled:scale-100' style={iconStyles}>{@render children?.()}</div>
    {#if text}
        <div class='ml-1'>{text}</div>
    {/if}
</svelte:element>
