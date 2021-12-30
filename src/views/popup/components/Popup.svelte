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
<main class="flex flex-col flex-1 min-w-[18rem] min-h-[6rem] max-h-[500px] overflow-x-hidden overflow-y-auto">
    {#if haveItems($storageData)}
        <WatchList />
    {:else}
        <div class="flex flex-col items-center justify-center py-2 h-full my-auto mx-4 text-center">
            <span>{getMsg('noQueries')}</span>
            <a class="flex items-center mt-2 font-medium" href={optionsHref} on:click={optionsClick}>
                <div class="h-5 w-5 mr-1">
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
    @import '../../../../node_modules/nprogress/nprogress.css';
</style>
