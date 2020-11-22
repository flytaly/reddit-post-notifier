<script>
    import { onMount } from 'svelte';
    import { routes } from '../route';
    import ShortcutsTable from './shortcuts-table.svelte';

    onMount(() => {
        if (window.location.hash) document.body.querySelector(window.location.hash)?.scrollIntoView();
    });

    const { sections } = routes.info;
</script>

<style>
</style>

<h1 id={routes.info.id}>Information</h1>
<h2 id={sections.shortcuts.id}>{sections.shortcuts.name}</h2>
<ShortcutsTable />
