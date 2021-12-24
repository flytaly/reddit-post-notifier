<script lang="ts">
    import { NotifyIcon, NotifyOffIcon } from '../../icons';

    export let checked = false;
    export let changeHander: () => void = undefined;

    const labelBtnClick = (e: KeyboardEvent & { currentTarget: HTMLLabelElement }) => {
        if (e.key === 'Enter' || e.key == ' ') {
            e.stopPropagation();
            e.preventDefault();
            e.currentTarget.querySelector('input').click();
        }
    };
</script>

<label
    class="flex items-center justify-center text-sm"
    on:focus
    on:mouseover
    on:mouseleave
    on:keydown={labelBtnClick}
    tabindex="0"
    {...$$restProps}
>
    <input class="hidden peer" type="checkbox" bind:checked on:change={changeHander} />
    <div
        class={`flex items-center justify-center select-none
            text-gray-50 rounded-2xl py-[2px] px-2 hover:brightness-110 transition-colors ${
                checked ? 'bg-skin-input-checked' : 'bg-gray-500'
            }`}
    >
        {#if checked}
            <div class="w-5 h-5">{@html NotifyIcon}</div>
        {:else}
            <div class="w-5 h-5">{@html NotifyOffIcon}</div>
        {/if}
        <span class="ml-[2px]">Notify</span>
    </div>
</label>
