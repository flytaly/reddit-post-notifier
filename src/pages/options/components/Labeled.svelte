<script>
    export let disabled = false;
    export let indent = false;
    export let title = '';
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class:indent class:disabled {title}>
    <slot name="input" />
    <slot name="description" />
    <slot />
</label>

<style>
    label {
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }
    label :global([slot='description']) {
        margin: auto 0.5rem;
    }
    .indent {
        margin-left: 2rem;
    }
    .disabled {
        cursor: not-allowed;
    }
</style>
