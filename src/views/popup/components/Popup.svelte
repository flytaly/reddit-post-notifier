<script lang="ts">
    import nProgress from 'nprogress';
    import { onMount } from 'svelte';
    import { browser } from 'webextension-polyfill-ts';
    import applyTheme from '../../../utils/apply-theme';
    import getMsg from '../../../utils/get-message';
    import { storageData } from '../store/store';
    import Header from './Header.svelte';
    import WatchList from './WatchList.svelte';
    import Footer from './Footer.svelte';

    onMount(() => {
        void applyTheme();
        nProgress.configure({ showSpinner: false });
    });

    const optionsHref = browser.runtime.getURL('options.html');
    const optionsClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await browser.runtime.openOptionsPage();
        window.close();
    };

    let havePosts: boolean | number = true;
    $: havePosts =
        $storageData.queriesList.length || $storageData.subredditList.length || $storageData.pinnedPostList.length;
</script>

<Header />
<main class="flex flex-col flex-1 min-w-[13rem] min-h-[4rem]">
    {#if havePosts}
        <WatchList />
    {:else}
        <div class="flex flex-col items-center justify-center py-2 h-full my-auto mx-4 text-center">
            <span>{getMsg('noQueries')}</span>
            <a href={optionsHref} on:click={optionsClick}>{getMsg('openOptions')} </a>
        </div>
    {/if}
</main>
<Footer />

<style global lang="postcss">
    @import './Popup.pcss';
    @import '../../../../node_modules/nprogress/nprogress.css';
</style>
