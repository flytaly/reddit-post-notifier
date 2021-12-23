<script lang="ts">
    export let checked = false;
    export let changeHandler: (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => void = undefined;

    /** Activate/toggle input on Enter and Space */
    const labelBtnClick = (e: KeyboardEvent & { currentTarget: HTMLLabelElement }) => {
        if (e.key === 'Enter' || e.key == ' ') {
            e.stopPropagation();
            e.preventDefault();
            e.currentTarget.querySelector('input').click();
        }
    };
</script>

<label
    class="flex space-x-1 items-center"
    on:keydown={labelBtnClick}
    tabindex="0"
    on:focus
    on:mouseover
    on:mouseleave
    {...$$restProps}
>
    <input class="peer hidden" type="checkbox" bind:checked on:change={changeHandler} />
    <div class="ios-checkbox" />
    <slot />
</label>
