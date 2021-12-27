<script lang="ts">
    /* Accessible radio buttons group */

    export let currentValue: string;
    export let valueList: Array<{ value: string; id: string; label: string }>;
    export let onChange: (value: string) => unknown;
    export let name = '';
</script>

<form class="flex overflow-visible py-1 bg-skin-input" on:change={() => onChange(currentValue)}>
    {#each valueList as { value, id, label }}
        <div class="overflow-visible group px-[2px]">
            <input class="absolute opacity-0 peer" type="radio" bind:group={currentValue} {value} {id} {name} />
            <label
                class="border border-skin-base bg-skin-input px-2 py-1
                text-skin-text text-sm
                transition-colors
                hover:brightness-90 active:brightness-125
                group-first:rounded-l group-last:rounded-r
                peer-checked:bg-skin-input-checked
                peer-checked:text-white
                peer-checked:hover:brightness-110
                peer-focus-visible:border-skin-outline
                peer-focus-visible:ring
                peer-focus-visible:ring-offset-1
                peer-focus-visible:ring-skin-outline
            "
                for={id}>{label}</label
            >
        </div>
    {/each}
</form>
