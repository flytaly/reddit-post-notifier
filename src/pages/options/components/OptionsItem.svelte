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

    let tag = $derived(labelFor ? 'label' : 'div');
    let attr = $derived(labelFor ? { for: labelFor } : {});
</script>

<article class={[
    { 'flex-col': column },
    'mb-6 mt-6 flex flex-col items-start overflow-hidden p-1 text-sm font-normal sm:flex-row',
]}>
    <svelte:element this={tag} class='mb-2 min-w-[18rem] flex-grow pr-4 leading-6 text-skin-gray' {...attr}>
        <header class="mb-2 text-base font-bold text-skin-text;">{title}</header>
        {@render description?.()}
    </svelte:element>
    <div class='pr-4 text-right'>
        {@render controls?.()}
    </div>
    {@render children?.()}
</article>
