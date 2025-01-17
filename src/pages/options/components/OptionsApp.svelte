<script lang="ts">
    import Settings from '@options/components/SettingsPage.svelte';
    import Sidebar from '@options/components/Sidebar.svelte';
    import BackupPage from '@options/components/backup/Backup.svelte';
    import Info from '@options/components/info/InfoPage.svelte';
    import ShortInfo from '@options/components/info/ShortInfo.svelte';
    import WatchPage from '@options/components/watch/WatchPage.svelte';
    import DonatePage from '@options/components/DonatePage.svelte';
    import { RefreshIcon } from '@options/lib/icons';
    import type { PageId } from '@options/lib/routes';
    import nProgress from 'nprogress';
    import { onMount } from 'svelte';
    import ReddixPromo from './info/ReddixPromo.svelte';
    import getMsg from '@/utils/get-message';
    import applyTheme from '@/utils/apply-theme';
    import { isUpdating } from '@options/lib/store';

    import 'nprogress/nprogress.css';
    import './OptionsApp.pcss';

    interface Props {
        pageId?: PageId;
    }

    const { pageId = 'settings' }: Props = $props();

    onMount(() => {
        void applyTheme();
        nProgress.configure({ showSpinner: false });
    });

    let page: { cmp: typeof Settings; name: string } = $state({ cmp: Settings, name: getMsg('optionsNavSettings') });

    $effect(() => {
        switch (pageId) {
            case 'info':
                page = { cmp: Info, name: getMsg('optionsNavInfo') };
                break;
            case 'import-export':
                page = { cmp: BackupPage, name: getMsg('optionsNavImportExport') };
                break;
            case 'watch':
                page = { cmp: WatchPage, name: getMsg('optionsNavWatch') };
                break;
            case 'donate':
                page = { cmp: DonatePage, name: 'Donate' };
                break;
            default:
                page = { cmp: Settings, name: getMsg('optionsNavSettings') };
        }
    });
</script>

<svelte:head>
    <title>{page.name}</title>
</svelte:head>

<div
    class="mx-auto grid max-w-[100rem] grid-cols-[max-content,1fr] justify-center gap-x-4 p-3 pt-0 xl:grid-cols-[max-content,1fr,min-content]"
>
    <div>
        <Sidebar current={pageId}> </Sidebar>
    </div>
    <div class="w-full">
        <div class="mb-5 mt-4 flex items-center justify-between">
            <div class="flex w-full justify-between gap-2">
                <ShortInfo />
                <ReddixPromo />
            </div>
            {#if $isUpdating}
                <div class="flex items-center rounded-md border border-skin-delimiter p-1">
                    <div class="mr-1 h-4 w-4" class:animate-spin={$isUpdating}>{@html RefreshIcon}</div>
                    <div>updating</div>
                </div>
            {/if}
        </div>
        <page.cmp />
    </div>
    <div class="hidden w-52 xl:block"></div>
</div>
