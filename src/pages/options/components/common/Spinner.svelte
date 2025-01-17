<script lang='ts'>
    import { LoadingIcon } from '@options/lib/icons';

    interface Props {
        label?: string;
        show?: boolean;
    }

    let { label = 'Loading', show = false }: Props = $props();
</script>

{#if show}
    <div class='flex space-x-1'>
        <div class='h-4 w-4 animate-spin' title='loading'>{@html LoadingIcon}</div>
        <span>{label}</span>
    </div>
{/if}
