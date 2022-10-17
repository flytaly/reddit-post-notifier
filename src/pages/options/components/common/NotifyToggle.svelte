<script lang="ts">
    import getMsg from '@/utils/get-message';
    import type { InputChangeEv } from './events';
    import { NotifyIcon, NotifyOffIcon } from '@options/icons';
    import { tooltip } from '@options/tooltip';

    export let checked: boolean = false;
    export let changeHander: ((e: InputChangeEv) => void) | undefined = undefined;
    export let tooltipText: string = '';

    const labelBtnClick = (e: KeyboardEvent & { currentTarget: HTMLLabelElement }) => {
        if (e.key === 'Enter' || e.key == ' ') {
            e.stopPropagation();
            e.preventDefault();
            e.currentTarget.querySelector('input')?.click();
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
    role="button"
    use:tooltip={{ content: tooltipText }}
    {...$$restProps}
>
    <input class="peer hidden" type="checkbox" bind:checked on:change={changeHander} />
    <div
        class={`flex items-center justify-center select-none
            text-gray-50 rounded-2xl py-[2px] px-2 hover:brightness-110 transition-colors ${
                checked ? 'bg-skin-input-checked' : 'bg-gray-500'
            }`}
    >
        {#if checked}
            <div class="h-5 w-5">{@html NotifyIcon}</div>
        {:else}
            <div class="h-5 w-5">{@html NotifyOffIcon}</div>
        {/if}
        <span class="ml-[2px]">{getMsg('notifyLabel')}</span>
    </div>
</label>
