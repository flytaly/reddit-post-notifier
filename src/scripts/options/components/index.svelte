<script>
    import { onMount } from 'svelte';
    import Sidebar from './sidebar.svelte';
    import SettingsPage from './settings-page.svelte';
    import InfoPage from './info-page.svelte';
    import { routes, hashToPage } from '../route';

    export let options;

    const defaultPage = routes.settings.id;
    let activePage = defaultPage;

    const setPageFromHash = () => {
        if (window.location.hash) {
            const page = hashToPage[window.location.hash];
            activePage = page || defaultPage;
        }
    };

    setPageFromHash();

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
        height: 100%;
    }
    .page {
        flex-grow: 1;
        padding-left: 1rem;
    }
</style>

<div class="main-container">
    <Sidebar {activePage} />
    <div class="page">
        {#if activePage === routes.settings.id}
            <SettingsPage />
        {:else if activePage === routes.info.id}
            <InfoPage />
        {/if}
    </div>
</div>
