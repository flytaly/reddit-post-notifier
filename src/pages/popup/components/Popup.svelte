<script lang='ts'>
    import nProgress from 'nprogress';
    import { onMount } from 'svelte';
    import browser from 'webextension-polyfill';
    import { WarningIcon } from '@options/lib/icons';
    import { storageData } from '../store/store';
    import { openLinksOnClick } from '../helpers/open-links';
    import handleKeydownEvent from '../helpers/handle-keys';
    import Header from './Header.svelte';
    import WatchList from './WatchList.svelte';
    import Footer from './Footer.svelte';
    import applyTheme from '@/utils/apply-theme';
    import getMsg from '@/utils/get-message';
    import SettingsIcon from '@/assets/settings.svg?raw';
    import type { StorageFields } from '@/storage/storage-types';
    import { extractPostGroups } from '@/utils/post-group';
    import type { PostGroup } from '@/utils/post-group';
    import { sendMessage } from '@/messaging';
    import type { OpenGroupsPayload } from '@/types/message';

    let groupsWithPosts: PostGroup[] = [];
    let groupsWithoutPosts: PostGroup[] = [];

    onMount(() => {
        void applyTheme();
        nProgress.configure({ showSpinner: false });
        openLinksOnClick();
        document.addEventListener('keydown', handleKeydownEvent);
        return () => {
            document.removeEventListener('keydown', handleKeydownEvent);
        };
    });

    $: ({ groupsWithPosts, groupsWithoutPosts } = extractPostGroups($storageData));

    $: if (groupsWithPosts.length > 0 && $storageData.options.onBadgeClick === 'openall') {
        const payload: OpenGroupsPayload = { groups: groupsWithPosts, remove: true };
        void sendMessage('OPEN_GROUPS', payload).then(() => window.close());
    }

    const optionsHref = browser.runtime.getURL('options.html');
    const optionsClick = async (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await browser.runtime.openOptionsPage();
        window.close();
    };

    const haveItems = (s: StorageFields) => {
        s = $storageData;
        /* eslint-disable svelte/indent */
        return Boolean(
            s.queriesList?.length
            || s.subredditList?.length
            || s.pinnedPostList?.length
            || s.usersList?.length
            || s.mail?.messages?.length
            || Object.keys(s.accounts || {}).length,
        );
    };

    const redditOrigin = 'https://*.reddit.com/*';
    let permissionsGranted = true;
    let permissionsErrMsg = '';

    async function checkPermissions() {
        const permissions = await browser.permissions.getAll();
        if (permissions.origins?.includes(redditOrigin)) {
            permissionsGranted = true;
            return;
        }
        permissionsGranted = false;
    }

    $: void checkPermissions();

    async function permissionsBtnClick() {
        const response = await browser.permissions.request({ origins: [redditOrigin] });
        if (!response) {
            permissionsErrMsg = 'Permission was refused';
            return;
        }
        permissionsGranted = true;
    }
</script>

<Header {groupsWithPosts} />
<main
    class='flex max-h-[500px] min-h-[6rem] min-w-[22rem] max-w-[32rem] flex-1 flex-col overflow-y-auto overflow-x-hidden pb-2'
>
    {#if !permissionsGranted}
        <div class='my-4 flex h-full justify-center py-2 text-center'>
            <button class='mt-2 flex gap-1 text-skin-error hover:underline' on:click={permissionsBtnClick}>
                <div class='h-5 w-5 text-skin-error'>
                    {@html WarningIcon}
                </div>
                <div>Click here to grant permissions to access reddit</div>
            </button>
            <div class='mt-1 text-skin-error'>{permissionsErrMsg}</div>
        </div>
    {/if}
    {#if haveItems($storageData)}
        <WatchList {groupsWithPosts} {groupsWithoutPosts} />
    {:else}
        <div class='mx-4 my-auto flex h-full flex-col items-center justify-center py-2 text-center'>
            <span>{getMsg('noQueries')}</span>
            <a class='mt-2 flex items-center font-medium' href={optionsHref} on:click={optionsClick}>
                <div class='mr-1 h-5 w-5'>
                    {@html SettingsIcon}
                </div>
                <span>{getMsg('openOptions')}</span>
            </a>
        </div>
    {/if}
</main>
<Footer />

<style global lang='postcss'>
    @import './Popup.pcss';
    @import '@/../node_modules/nprogress/nprogress.css';
</style>
