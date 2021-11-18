<script lang="ts">
    import { onMount } from 'svelte';
    import { connectToBg } from '@/port';
    import applyTheme from '@/utils/apply-theme';
    import { pageInfo } from '../routes';
    import Sidebar from './Sidebar.svelte';

    onMount(() => {
        void applyTheme();
        connectToBg('options');
    });
</script>

<svelte:head>
    <title>{$pageInfo.title}</title>
</svelte:head>

<div
    class="grid grid-cols-[max-content,minmax(auto,42rem)] gap-4 p-3 justify-center min-h-screen bg-skin-base text-skin-base w-screen"
>
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
