<script lang="ts">
    import Sidebar from './Sidebar.svelte';
    import { pageInfo } from '../routes';
</script>

<svelte:head>
    <title>{$pageInfo.title}</title>
</svelte:head>

<div class="grid grid-cols-[max-content,auto]">
    <div>
        <Sidebar current={$pageInfo.sectionId} />
    </div>
    <svelte:component this={$pageInfo.cmp} />
</div>

<style global lang="postcss">
    @import '../../../../node_modules/tippy.js/dist/tippy.css';
    @import '../../base-styles.pcss';
</style>
