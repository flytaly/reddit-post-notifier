<script lang="ts">
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();
</script>

<div class='my-2 text-sm leading-6 text-skin-gray'>{@render children?.()}</div>
