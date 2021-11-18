<script lang="ts">
    /* Accessible radio buttons group */

    export let currentValue: string;
    export let valueList: Array<{ value: string; id: string; label: string }>;
    export let onChange: (value: string) => unknown;
    export let name: string;
</script>

<form class="flex overflow-visible" on:change={() => onChange(currentValue)}>
    {#each valueList as { value, id, label }}
        <input class="absolute opacity-0" type="radio" bind:group={currentValue} {value} {id} {name} />
        <label for={id}>{label}</label>
    {/each}
</form>

<style lang="postcss">
    label {
        @apply border
            border-skin-base
            bg-skin-btn
            px-2
            py-1
            text-skin-base
            text-sm
            transition-colors
            hover:brightness-90
            active:brightness-125;
    }

    input:checked + label {
        @apply bg-skin-input-checked text-white hover:brightness-110;
    }

    input:focus-visible + label {
        @apply border-skin-outline
            ring
            ring-offset-1
            ring-skin-outline;
    }
</style>
