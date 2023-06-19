<script lang="ts">
    import type { InputChangeEv } from './events';
    import { tooltip } from '@options/lib/tooltip';

    export let checked: boolean = false;
    export let changeHandler: ((e: InputChangeEv) => void) | undefined = undefined;
    export let tooltipText: string = '';

    /** Activate/toggle input on Enter and Space */
    const btnClick = (e: KeyboardEvent & { currentTarget: HTMLElement }) => {
        if (e.key === 'Enter' || e.key == ' ') {
            e.stopPropagation();
            e.preventDefault();
            e.currentTarget.querySelector('input')?.click();
        }
    };
</script>

<div
    on:keydown={btnClick}
    tabindex="0"
    on:focus
    on:mouseover
    on:mouseleave
    role="button"
    use:tooltip={{ content: tooltipText }}
    {...$$restProps}
>
    <label class="flex max-w-max items-center space-x-1">
        <span class="hidden">{tooltipText}</span>
        <input class="peer hidden" type="checkbox" bind:checked on:change={changeHandler} />
        <div class="ios-checkbox shrink-0" />
        <slot />
    </label>
</div>
