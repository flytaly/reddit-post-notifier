<script lang="ts">
    import { LoadingIcon } from '../../icons';
    export let label = 'Loading';
    export let show = false;
</script>

{#if show}
    <div class="flex space-x-1">
        <div class="w-4 h-4 animate-spin" title="loading">{@html LoadingIcon}</div>
        <span>{label}</span>
    </div>
{/if}
