<script lang="ts">
    import getMsg from '@/utils/get-message';
    import type { InputChangeEv } from './events';
    import { NotifyIcon, NotifyOffIcon } from '@options/lib/icons';
    import { tooltip } from '@options/lib/tooltip';

    export let checked: boolean = false;
    export let changeHandler: ((e: InputChangeEv) => void) | undefined = undefined;
    export let tooltipText: string = '';

    const btnClick = (e: KeyboardEvent & { currentTarget: HTMLElement }) => {
        if (e.key === 'Enter' || e.key == ' ') {
            e.stopPropagation();
            e.preventDefault();
            e.currentTarget.querySelector('input')?.click();
        }
    };
</script>

<div
    class="toggle-button"
    class:toggle-button-on={checked}
    on:keydown={btnClick}
    tabindex="0"
    role="button"
    use:tooltip={{ content: tooltipText }}
    {...$$restProps}
>
    <label class="flex max-w-max items-center space-x-1">
        <input class="peer hidden" type="checkbox" aria-label={tooltipText} bind:checked on:change={changeHandler} />
        <div class="flex">
            {#if checked}
                <div class="h-5 w-5">{@html NotifyIcon}</div>
            {:else}
                <div class="h-5 w-5">{@html NotifyOffIcon}</div>
            {/if}
            <span class="ml-[2px]">{getMsg('notifyLabel')}</span>
        </div>
    </label>
</div>
