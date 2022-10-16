<script lang="ts">
    /* Accessible radio buttons group */

    export let currentValue: string;
    export let valueList: Array<{ value: string; id: string; label: string }>;
    export let onChange: (value: string) => unknown;
    export let name = '';
</script>

<form class="flex overflow-visible bg-skin-input py-1" on:change={() => onChange(currentValue)}>
    {#each valueList as { value, id, label }}
        <div class="group overflow-visible px-[2px]">
            <input class="peer absolute opacity-0" type="radio" bind:group={currentValue} {value} {id} {name} />
            <label
                class="border border-skin-base bg-skin-input px-2 py-1
                text-sm text-skin-text
                transition-colors
                hover:brightness-90 active:brightness-125
                group-first:rounded-l group-last:rounded-r
                peer-checked:bg-skin-input-checked
                peer-checked:text-white
                peer-checked:hover:brightness-110
                peer-focus-visible:border-skin-outline
                peer-focus-visible:ring
                peer-focus-visible:ring-skin-outline
                peer-focus-visible:ring-offset-1
            "
                for={id}>{label}</label
            >
        </div>
    {/each}
</form>
