<script lang="ts">
    import { AddIcon } from '@options/lib/icons';
    import type { ButtonMouseEv } from './events';
    export let clickHandler: ((e: ButtonMouseEv) => void) | undefined = undefined;
    export let disabled = false;
</script>

<button
    class="standard-button flex items-center rounded border-transparent bg-transparent p-1 text-skin-accent2 hover:border-skin-accent2 disabled:hover:border-skin-gray"
    on:click={clickHandler}
    {disabled}
>
    <span class="mr-1 h-5 w-5">
        {@html AddIcon}
    </span>
    <slot />
</button>
