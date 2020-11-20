<script>
    export let title;
</script>

<style>
    article {
        display: flex;
        font-weight: normal;
        font-size: 0.95rem;
        margin-bottom: 2rem;
    }
    .description {
        flex-grow: 1;
        padding-right: 1rem;
    }
    .description :global([slot='description']) {
        color: var(--grey);
    }
    header {
        font-weight: bold;
        font-size: 1.1rem;
        margin-bottom: 0.8rem;
    }
    .controls {
        min-width: 12rem;
        text-align: right;
        padding-right: 1rem;
    }
</style>

<article>
    <div class="description">
        <header>{title}</header>
        <slot name="description" />
    </div>
    <div class="controls">
        <slot name="controls" />
    </div>
    <slot />
</article>
