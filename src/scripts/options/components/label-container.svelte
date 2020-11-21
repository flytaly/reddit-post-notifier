<script>
    export let disabled = false;
    export let indent = false;
    export let title = '';
</script>

<style>
    label {
        display: flex;
        justify-content: flex-start;
        align-content: center;
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

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class:indent class:disabled {title}>
    <slot name="input" />
    <slot name="description" />
    <slot />
</label>
