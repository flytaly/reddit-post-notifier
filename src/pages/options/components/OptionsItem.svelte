<script lang='ts'>
    interface Props {
        title?: string;
        column?: boolean;
        labelFor?: string | null;
        description?: import('svelte').Snippet;
        controls?: import('svelte').Snippet;
        children?: import('svelte').Snippet;
    }

    let {
        title = '',
        column = false,
        labelFor = null,
        description,
        controls,
        children,
    }: Props = $props();
</script>

<article class:column>
    {#if labelFor}
        <label for={labelFor} class='description'>
            <header>{title}</header>
            {@render description?.()}
        </label>
    {:else}
        <div class='description'>
            <header>{title}</header>
            {@render description?.()}
        </div>
    {/if}
    <div class='pr-4 text-right'>
        {@render controls?.()}
    </div>
    {@render children?.()}
</article>

<style lang='postcss'>
    article {
        @apply mb-6 mt-6 flex flex-col items-start overflow-hidden p-1 text-sm font-normal sm:flex-row;
    }
    .column {
        flex-direction: column;
    }
    .description {
        @apply mb-2 min-w-[18rem] flex-grow pr-4 leading-6 text-skin-gray;
    }
    header {
        @apply mb-2 text-base font-bold text-skin-text;
    }
</style>
