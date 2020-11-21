<script>
    /* Accessible radio buttons group */

    export let initialValue;
    export let valueList; // [{value: 'value', id:'id', label: 'label'}]
    export let onChange;

    let currentValue = initialValue;
</script>

<style>
    form {
        display: flex;
    }
    input {
        opacity: 0;
        position: absolute;
    }
    label {
        border: 1px solid var(--border-color);
        padding: 0.3rem 0.8rem;
    }
    input:checked + label {
        background-color: var(--accent-color-fill);
    }
    input:-moz-focusring + label {
        outline: 2px solid var(--outline-color);
        outline-offset: 2px;
    }
    input:focus-visible + label {
        outline: 2px solid var(--outline-color);
        outline-offset: 2px;
    }
</style>

<form
    on:change={() => {
        onChange(currentValue);
    }}>
    {#each valueList as { value, id, label }}
        <input type="radio" bind:group={currentValue} {value} {id} name={value} />
        <label for={id} class="is-button"> {label}</label>
    {/each}
</form>
