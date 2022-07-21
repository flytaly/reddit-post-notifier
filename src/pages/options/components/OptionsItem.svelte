<script lang="ts">
    export let title = '';
    export let column = false;
    export let labelFor: string | null = null;
</script>

<article class:column>
    {#if labelFor}
        <label for={labelFor} class="description">
            <header>{title}</header>
            <slot name="description" />
        </label>
    {:else}
        <div class="description">
            <header>{title}</header>
            <slot name="description" />
        </div>
    {/if}
    <div class="text-right pr-4">
        <slot name="controls" />
    </div>
    <slot />
</article>

<style lang="postcss">
    article {
        @apply flex flex-row items-start font-normal text-sm  mb-6 overflow-hidden p-1;
    }
    .column {
        flex-direction: column;
    }
    .description {
        @apply text-skin-gray flex-grow pr-4 mb-2 leading-6;
    }
    :not(.column) .description :global([slot='description']) {
        max-width: 90%;
    }
    header {
        @apply text-skin-text font-bold text-base mb-2;
    }
</style>
