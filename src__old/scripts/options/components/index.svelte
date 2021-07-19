<script>
    import { onMount } from 'svelte';
    import Sidebar from './sidebar.svelte';
    import SettingsPage from './settings-page.svelte';
    import InfoPage from './info-page.svelte';
    import { routes, hashToPage } from '../route';
    import storage from '../../storage';

    const storageDataPromise = storage.getAllData(true);

    const defaultPage = routes.settings.id;
    let activePage = defaultPage;

    const setPageFromHash = () => {
        if (window.location.hash) {
            const page = hashToPage[window.location.hash];
            activePage = page || defaultPage;
        }
    };

    setPageFromHash();

    let pageTitle = `Reddit Post Notifier`;
    $: pageTitle = `Reddit Post Notifier | ${activePage === routes.info.id ? 'Information' : 'Settings'} `;

    onMount(() => {
        const listener = () => {
            setPageFromHash();
        };
        window.addEventListener('hashchange', listener, false);
        return () => {
            window.removeEventListener('hashchange', listener, false);
        };
    });
</script>

<style>
    .main-container {
        display: flex;
        flex-direction: row;
    }
    .page {
        padding-left: 1rem;
        padding-bottom: 10rem;
        height: 100%;
        width: 50rem;
        max-width: 100%;
    }
</style>

<svelte:head>
    <title>{pageTitle}</title>
</svelte:head>

<div class="main-container">
    <Sidebar {activePage} />
    <div class="page">
        {#await storageDataPromise then data}
            {#if activePage === routes.info.id}
                <InfoPage />
            {:else}
                <SettingsPage {data} />
            {/if}
        {/await}
    </div>
</div>
