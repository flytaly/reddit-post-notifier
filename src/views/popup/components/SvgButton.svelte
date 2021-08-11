<script lang="ts">
    export let title = '';
    export let href: string | null = null;
    export let disabled = false;
    export let text = '';
</script>

{#if href}
    <a class="svg-button group" class:with-text={text} {href} {title} on:click>
        <div class="icon"><slot /></div>
        {#if text}
            <div class="ml-1">{text}</div>
        {/if}
    </a>
{:else}
    <button class="svg-button group" class:with-text={text} {title} {disabled} on:click>
        <div class="icon"><slot /></div>
        {#if text}
            <div class="ml-1">{text}</div>
        {/if}
    </button>
{/if}

<style lang="postcss">
    .svg-button {
        @apply flex items-center justify-center p-0 transition;
    }
    .icon {
        @apply group-hover:scale-110 group-active:scale-95 h-4 w-4 group-disabled:scale-100;
    }
    .with-text {
        @apply bg-skin-input px-1 border border-skin-base hover:bg-skin-hover disabled:hover:bg-skin-input;
    }
</style>
