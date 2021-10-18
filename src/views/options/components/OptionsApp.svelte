<script lang="ts">
    import Sidebar from './Sidebar.svelte';
    import { pageInfo } from '../routes';
    import { onMount } from 'svelte';
    import { connectToBg } from '../../../port';
    import applyTheme from '../../../utils/apply-theme';

    onMount(() => {
        void applyTheme();
        connectToBg('options');
    });
</script>

<svelte:head>
    <title>{$pageInfo.title}</title>
</svelte:head>

<div class="grid grid-cols-[max-content,auto] gap-4 p-3 justify-center bg-skin-base text-skin-base min-h-screen">
    <div>
        <Sidebar current={$pageInfo.page} />
    </div>
    <div class="w-full max-w-2xl">
        <svelte:component this={$pageInfo.cmp} />
    </div>
</div>

<style global lang="postcss">
    @import '../../../../node_modules/tippy.js/dist/tippy.css';
    @import './OptionsApp.pcss';
</style>
