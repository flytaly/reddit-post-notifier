<script lang='ts'>
    import { AddIcon } from '@options/lib/icons';
    import type { ButtonMouseEv } from './events';

    interface Props {
        clickHandler: ((e: ButtonMouseEv) => void) | undefined;
        disabled?: boolean;
        children?: import('svelte').Snippet;
    }

    let { clickHandler, disabled = false, children }: Props = $props();
</script>

<button
    class='standard-button flex items-center rounded border-transparent bg-transparent p-1 text-skin-accent2 hover:border-skin-accent2 disabled:hover:border-skin-gray'
    onclick={clickHandler}
    {disabled}
>
    <span class='mr-1 h-5 w-5'>
        {@html AddIcon}
    </span>
    {@render children?.()}
</button>
