<script lang='ts'>
    import { tooltip } from '@options/lib/tooltip';
    import type { InputChangeEv } from './events';
    import type { HTMLAttributes } from 'svelte/elements';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        checked?: boolean;
        changeHandler?: ((e: InputChangeEv) => void) | undefined;
        tooltipText?: string;
        children?: import('svelte').Snippet;
    }

    let {
        checked = $bindable(false),
        changeHandler = undefined,
        tooltipText = '',
        children,
        ...rest
    }: Props = $props();

    /** Activate/toggle input on Enter and Space */
    const btnClick = (e: KeyboardEvent & { currentTarget: HTMLElement }) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
            e.preventDefault();
            e.currentTarget.querySelector('input')?.click();
        }
    };
</script>

<div
    onkeydown={btnClick}
    tabindex='0'
    role='button'
    use:tooltip={{ content: tooltipText }}
    {...rest}
>
    <label class='flex max-w-max items-center space-x-1'>
        <span class='hidden'>{tooltipText}</span>
        <input class='peer hidden' type='checkbox' bind:checked onchange={changeHandler} />
        <div class='ios-checkbox shrink-0'></div>
        {@render children?.()}
    </label>
</div>
