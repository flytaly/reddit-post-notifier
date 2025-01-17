<script lang='ts'>
    import type { HTMLAttributes } from 'svelte/elements';

    interface Props extends HTMLAttributes<HTMLElement> {
        href?: string | null;
        disabled?: boolean;
        text?: string;
        w?: string;
        h?: string;
        children?: import('svelte').Snippet;
    }

    let {
        href = null,
        disabled = false,
        text = '',
        w = '1rem',
        h = w,
        children,
        ...rest
    }: Props = $props();

    let iconStyles = $derived(`width:${w};height:${h};`);

</script>

{#if href}
    <a class='svg-button group' class:with-text={text} {href} {...rest}>
        <div class='icon' style={iconStyles}>{@render children?.()}</div>
        {#if text}
            <div class='ml-1'>{text}</div>
        {/if}
    </a>
{:else}
    <button class='svg-button group' class:with-text={text} {disabled} {...rest}>
        <div class='icon' style={iconStyles}>{@render children?.()}</div>
        {#if text}
            <div class='ml-1'>{text}</div>
        {/if}
    </button>
{/if}

<style lang='postcss'>
    .svg-button {
        @apply flex items-center justify-center p-0 transition disabled:text-skin-gray2;
    }
    .icon {
        @apply group-hover:scale-110 group-active:scale-95 group-disabled:scale-100;
    }
    .with-text:not(:disabled) {
        @apply px-1 ring-skin-delimiter hover:bg-skin-btn hover:ring-1 active:brightness-110;
    }
</style>
