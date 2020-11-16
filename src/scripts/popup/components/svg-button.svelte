<script>
    export let title = '';
    export let href = null;
    export let disabled = false;
    export let text = '';
</script>

<style>
    .svg-button {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: none;
        background: none;
        transition: 150ms;
        color: var(--font-color);
        font-size: inherit;
    }
    .text {
        margin-left: 0.2rem;
    }
    .svg-button :global(svg) {
        width: 16px;
        height: 16px;
    }
    .svg-button:hover :global(svg),
    .svg-button:focus :global(svg) {
        transform: scale(1.08);
    }
    .svg-button:active :global(svg) {
        transform: scale(0.92);
    }
    .svg-button.with-text {
        padding: 0.1rem 0.2rem;
        border: 1px solid var(--hover-border-color);
        /* background-color: var(--hover-bg-color); */
        color: var(--footer-font-color);
    }
    .svg-button.with-text:hover:not([disabled]),
    .svg-button.with-text:focus:not([disabled]) {
        background-color: var(--hover-border-color);
        outline: none;
    }
    .svg-button.with-text:active:not([disabled]) {
        background-color: var(--hover-bg-color2);
    }
    .svg-button.with-text :global(svg) {
        width: 14px;
        height: 14px;
    }
</style>

{#if href}
    <a class="svg-button" {href} {title} class:with-text={text} on:click>
        <slot />
        {#if text}
            <div class="text">{text}</div>
        {/if}
    </a>
{:else}
    <button class="svg-button" {title} {disabled} class:with-text={text} on:click>
        <slot />
        {#if text}
            <div class="text">{text}</div>
        {/if}
    </button>
{/if}
