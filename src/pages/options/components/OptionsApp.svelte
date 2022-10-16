<script lang="ts">
    import { onMount } from 'svelte';
    import { connectToBg } from '@/port';
    import applyTheme from '@/utils/apply-theme';
    import Sidebar from '@options/components/Sidebar.svelte';
    import ShortInfo from '@options/components/info/ShortInfo.svelte';
    import Settings from '@options/components/SettingsPage.svelte';
    import Info from '@options/components/info/InfoPage.svelte';
    import getMsg from '@/utils/get-message';
    import type { PageId } from '@options/routes';
    import BackupPage from '@options/components/backup/Backup.svelte';
    import WatchPage from '@options/components/watch/WatchPage.svelte';

    export let pageId: PageId = 'settings';

    onMount(() => {
        void applyTheme();
        connectToBg('options');
    });

    let page: { cmp: typeof Settings; name: string } = { cmp: Settings, name: getMsg('optionsNavSettings') };

    $: switch (pageId) {
        case 'info':
            page = { cmp: Info, name: getMsg('optionsNavInfo') };
            break;
        case 'import-export':
            page = { cmp: BackupPage, name: getMsg('optionsNavImportExport') };
            break;
        case 'watch':
            page = { cmp: WatchPage, name: getMsg('optionsNavWatch') };
            break;
        default:
            page = { cmp: Settings, name: getMsg('optionsNavSettings') };
    }
</script>

<svelte:head>
    <title>{page.name}</title>
</svelte:head>

<div class="grid grid-cols-[max-content,minmax(auto,42rem)] justify-center gap-x-4 p-3 pt-0">
    <div class="sticky top-0">
        <Sidebar current={pageId} />
    </div>
    <div class="w-full max-w-2xl">
        <div class="mt-4 mb-5">
            <ShortInfo />
        </div>
        <svelte:component this={page.cmp} />
    </div>
</div>

<style global lang="postcss">
    @import '../../../../node_modules/tippy.js/dist/tippy.css';
    @import './OptionsApp.pcss';
</style>
