<script>
    export let keysTarget = null;
</script>

<style>
    ul {
        display: flex;
        flex-direction: column;
        list-style: none;
        padding: 0;
        margin: 0;
        min-width: 200px;
        max-width: 500px;
    }
    ul > :global(li > .row) {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 0 0.5em;
        width: 100%;
        border-top: 1px solid var(--main-bg-color);
        border-bottom: 1px solid var(--main-bg-color);
    }

    ul > :global(li:focus > .row),
    ul > :global(li:hover > .row) {
        background-color: var(--hover-bg-color);
        border-top: 1px solid var(--hover-border-color);
        border-bottom: 1px solid var(--hover-border-color);
        outline: none;
    }
</style>

<ul data-keys-target={keysTarget}>
    <slot />
</ul>
