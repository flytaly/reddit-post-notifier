<script lang='ts'>
    interface Props {
        /* Accessible radio buttons group */
        currentValue: string;
        valueList: Array<{ value: string; id: string; label: string }>;
        onChange: (value: string) => unknown;
        name?: string;
    }

    let {
        currentValue = $bindable(),
        valueList,
        onChange,
        name = '',
    }: Props = $props();
</script>

<form class='flex gap-2 gap-y-4 overflow-visible py-1' onchange={() => onChange(currentValue)}>
    {#each valueList as { value, id, label }}
        <div class='group overflow-visible'>
            <input class='peer absolute opacity-0' type='radio' bind:group={currentValue} {value} {id} {name} />
            <label
                class='border border-skin-base bg-skin-input px-2 py-1
                    text-sm text-skin-text
                    transition-colors
                    hover:brightness-90 active:brightness-125
                    group-first:rounded-l group-last:rounded-r
                    peer-checked:bg-skin-input-checked
                    peer-checked:text-white
                    peer-focus-visible:border-skin-outline
                    peer-focus-visible:ring
                    peer-focus-visible:ring-skin-outline
                    peer-focus-visible:ring-offset-1
                '
                for={id}>{label}</label
            >
        </div>
    {/each}
</form>
