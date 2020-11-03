<script>
    export let title = '';
    export let href = null;
    export let disabled = false;
</script>

<style>
    .svg-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        padding: 0;
        border: none;
        background: none;
        transition: 150ms;
    }
    .svg-button:hover,
    .svg-button:focus {
        transform: scale(1.08);
    }
    .svg-button:active {
        transform: scale(0.92);
    }
</style>

{#if href}
    <a class="svg-button" {href} {title} on:click>
        <slot />
    </a>
{:else}
    <button class="svg-button" {title} {disabled} on:click>
        <slot />
    </button>
{/if}
