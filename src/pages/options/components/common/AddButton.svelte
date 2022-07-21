<script lang="ts">
    import { AddIcon } from '@/pages/options/icons';
    import type { ButtonMouseEv } from './events';
    export let clickHandler: ((e: ButtonMouseEv) => void) | undefined = undefined;
    export let disabled = false;
</script>

<button
    class="flex items-center rounded p-1 bg-transparent border-transparent hover:border-skin-accent2 text-skin-accent2 disabled:hover:border-skin-gray"
    on:click={clickHandler}
    {disabled}
>
    <span class="w-5 h-5 mr-1">
        {@html AddIcon}
    </span>
    <slot />
</button>
