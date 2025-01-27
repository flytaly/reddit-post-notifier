<script lang='ts'>
    import { NotifyIcon, NotifyOffIcon } from '@options/lib/icons';
    import { tooltip } from '@options/lib/tooltip';
    import type { InputChangeEv } from './events';
    import getMsg from '@/utils/get-message';
    import type { HTMLAttributes } from 'svelte/elements';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        checked?: boolean;
        changeHandler?: ((e: InputChangeEv) => void) | undefined;
        tooltipText?: string;
    }

    let { checked = $bindable(false), changeHandler, tooltipText = '', ...rest }: Props = $props();

    const btnClick = (e: KeyboardEvent & { currentTarget: HTMLElement }) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
            e.preventDefault();
            e.currentTarget.querySelector('input')?.click();
        }
    };
</script>

<div
    class={[
        'toggle-button',
        { 'toggle-button-on': checked },
    ]}
    onkeydown={btnClick}
    tabindex='0'
    role='button'
    use:tooltip={{ content: tooltipText }}
    {...rest}
>
    <label class='flex max-w-max items-center space-x-1'>
        <input class='peer hidden' type='checkbox' aria-label={tooltipText} bind:checked onchange={changeHandler} />
        <div class='flex'>
            {#if checked}
                <div class='h-5 w-5'>{@html NotifyIcon}</div>
            {:else}
                <div class='h-5 w-5'>{@html NotifyOffIcon}</div>
            {/if}
            <span class='ml-[2px]'>{getMsg('notifyLabel')}</span>
        </div>
    </label>
</div>
