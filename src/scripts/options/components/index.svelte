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
    }
    .page {
        padding-left: 1rem;
        height: 100%;
        width: 900px;
        max-width: 100%;
    }
</style>

<div class="main-container">
    <Sidebar {activePage} />
    <div class="page">
        {#if activePage === routes.settings.id}
            <SettingsPage {options} />
        {:else if activePage === routes.info.id}
            <InfoPage />
        {/if}
    </div>
</div>
