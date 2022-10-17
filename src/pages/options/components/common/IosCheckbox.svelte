<script lang="ts">
    import type { InputChangeEv } from './events';
    import { tooltip } from '@options/tooltip';

    export let checked: boolean = false;
    export let changeHandler: ((e: InputChangeEv) => void) | undefined = undefined;
    export let tooltipText: string;

    /** Activate/toggle input on Enter and Space */
    const labelBtnClick = (e: KeyboardEvent & { currentTarget: HTMLLabelElement }) => {
        if (e.key === 'Enter' || e.key == ' ') {
            e.stopPropagation();
            e.preventDefault();
            e.currentTarget.querySelector('input')?.click();
        }
    };
</script>

<label
    class="flex items-center space-x-1"
    on:keydown={labelBtnClick}
    tabindex="0"
    on:focus
    on:mouseover
    on:mouseleave
    role="button"
    use:tooltip={{ content: tooltipText }}
    area-label={{ tooltipText }}
    {...$$restProps}
>
    <input class="peer hidden" type="checkbox" bind:checked on:change={changeHandler} />
    <div class="ios-checkbox shrink-0" />
    <slot />
</label>
