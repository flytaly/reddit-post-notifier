<script lang="ts">
    /* eslint-disable @typescript-eslint/no-unsafe-argument */
    import nProgress from 'nprogress';
    import { onMount } from 'svelte';
    import { browser } from 'webextension-polyfill-ts';
    import applyTheme from '@/utils/apply-theme';
    import getMsg from '@/utils/get-message';
    import { storageData } from '../store/store';
    import Header from './Header.svelte';
    import WatchList from './WatchList.svelte';
    import Footer from './Footer.svelte';
    import { openLinksOnClick } from '../helpers/open-links';
    import handleKeydownEvent from '../helpers/handle-keys';
    import SettingsIcon from '@/assets/settings.svg';
    import type { StorageFields } from '@/storage/storage-types';

    onMount(() => {
        void applyTheme();
        nProgress.configure({ showSpinner: false });
        openLinksOnClick();
        document.addEventListener('keydown', handleKeydownEvent);
        return () => {
            document.removeEventListener('keydown', handleKeydownEvent);
        };
    });

    const optionsHref = browser.runtime.getURL('options.html');
    const optionsClick = async (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await browser.runtime.openOptionsPage();
        window.close();
    };

    const haveItems = (s: StorageFields) => {
        s = $storageData;
        return Boolean(
            s.queriesList?.length ||
                s.subredditList?.length ||
                s.pinnedPostList?.length ||
                s.usersList?.length ||
                Object.keys(s.accounts || {}).length,
        );
    };
</script>

<Header />
<main
    class="flex max-h-[500px] min-h-[6rem] min-w-[22rem] max-w-[32rem] flex-1 flex-col overflow-y-auto overflow-x-hidden pb-2"
>
    {#if haveItems($storageData)}
        <WatchList />
    {:else}
        <div class="my-auto mx-4 flex h-full flex-col items-center justify-center py-2 text-center">
            <span>{getMsg('noQueries')}</span>
            <a class="mt-2 flex items-center font-medium" href={optionsHref} on:click={optionsClick}>
                <div class="mr-1 h-5 w-5">
                    {@html SettingsIcon}
                </div>
                <span>{getMsg('openOptions')}</span>
            </a>
        </div>
    {/if}
</main>
<Footer />

<style global lang="postcss">
    @import './Popup.pcss';
    @import '@/../node_modules/nprogress/nprogress.css';
</style>
