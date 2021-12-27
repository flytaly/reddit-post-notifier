<script lang="ts">
    import { onMount } from 'svelte';
    import { connectToBg } from '@/port';
    import applyTheme from '@/utils/apply-theme';
    import { pageInfo } from '../routes';
    import Sidebar from './Sidebar.svelte';
    import ShortInfo from './info/ShortInfo.svelte';

    onMount(() => {
        void applyTheme();
        connectToBg('options');
    });
</script>

<svelte:head>
    <title>{$pageInfo.title}</title>
</svelte:head>

<div class="grid grid-cols-[max-content,minmax(auto,42rem)] gap-x-4 p-3 pt-0 justify-center">
    <div class="sticky top-0">
        <Sidebar current={$pageInfo.page} />
    </div>
    <div class="w-full max-w-2xl">
        <div class="mt-4 mb-5">
            <ShortInfo />
        </div>
        <svelte:component this={$pageInfo.cmp} />
    </div>
</div>

<style global lang="postcss">
    @import '../../../../node_modules/tippy.js/dist/tippy.css';
    @import './OptionsApp.pcss';
</style>
