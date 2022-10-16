<script lang="ts">
    export let title = '';
    export let href: string | null = null;
    export let disabled = false;
    export let text = '';
    export let w = '1rem';
    export let h = w;

    let iconStyles = '';
    $: iconStyles = `width:${w};height:${h};`;
</script>

{#if href}
    <a class="svg-button group" class:with-text={text} {href} {title} on:click>
        <div class="icon" style={iconStyles}><slot /></div>
        {#if text}
            <div class="ml-1">{text}</div>
        {/if}
    </a>
{:else}
    <button class="svg-button group" class:with-text={text} {title} {disabled} on:click>
        <div class="icon" style={iconStyles}><slot /></div>
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
        @apply group-hover:scale-110 group-active:scale-95 group-disabled:scale-100;
    }
    .with-text {
        @apply border border-skin-base bg-skin-btn
        px-1 hover:bg-skin-btn-hover active:bg-skin-btn-active disabled:hover:bg-skin-btn;
    }
</style>
