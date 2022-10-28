<script lang="ts">
    import { LoadingIcon } from '@options/lib/icons';
    export let label = 'Loading';
    export let show = false;
</script>

{#if show}
    <div class="flex space-x-1">
        <div class="h-4 w-4 animate-spin" title="loading">{@html LoadingIcon}</div>
        <span>{label}</span>
    </div>
{/if}
