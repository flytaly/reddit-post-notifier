<script>
    export let title = '';
    export let column = false;
</script>

<style>
    article {
        display: flex;
        flex-direction: row;
        font-weight: normal;
        font-size: 0.95rem;
        margin-bottom: 1.5rem;
    }
    .column {
        flex-direction: column;
    }
    .description {
        flex-grow: 1;
        padding-right: 1rem;
    }
    .description :global([slot='description']) {
        color: var(--grey);
        margin-bottom: 0.5rem;
    }
    :not(.column) .description :global([slot='description']) {
        max-width: 80%;
    }
    header {
        font-weight: bold;
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
    }
    .controls {
        text-align: right;
        padding-right: 1rem;
    }
</style>

<article class:column>
    <div class="description">
        <header>{title}</header>
        <slot name="description" />
    </div>
    <div class="controls">
        <slot name="controls" />
    </div>
    <slot />
</article>
