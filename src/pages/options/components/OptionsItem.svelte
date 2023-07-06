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
    <div class="pr-4 text-right">
        <slot name="controls" />
    </div>
    <slot />
</article>

<style lang="postcss">
    article {
        @apply mb-6 mt-6 flex flex-row items-start overflow-hidden  p-1 text-sm font-normal;
    }
    .column {
        flex-direction: column;
    }
    .description {
        @apply mb-2 flex-grow pr-4 leading-6 text-skin-gray;
    }
    :not(.column) .description :global([slot='description']) {
        max-width: 90%;
    }
    header {
        @apply mb-2 text-base font-bold text-skin-text;
    }
</style>
