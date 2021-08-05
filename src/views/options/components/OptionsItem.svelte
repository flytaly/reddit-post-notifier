<script lang="ts">
    export let title = '';
    export let column = false;
    export let labelFor = null;
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
        @apply flex flex-row items-start font-normal text-sm  mb-6;
    }
    .column {
        flex-direction: column;
    }
    .description {
        @apply text-skin-gray flex-grow pr-4 mb-2;
    }
    :not(.column) .description :global([slot='description']) {
        max-width: 80%;
    }
    header {
        @apply text-skin-base font-bold text-base mb-2;
    }
</style>
