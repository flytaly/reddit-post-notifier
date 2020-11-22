<script>
    import { onMount } from 'svelte';
    import { routes } from '../route';
    import ShortcutsTable from './shortcuts-table.svelte';
    import ShortInfo from './short-info.svelte';
    import HowToUse from './how-to-use.svelte';

    onMount(() => {
        if (window.location.hash) document.body.querySelector(window.location.hash)?.scrollIntoView();
    });

    const { sections } = routes.info;
</script>

<style>
    section {
        margin-bottom: 2rem;
    }
</style>

<h1 id={routes.info.id}>Information</h1>
<section>
    <ShortInfo />
</section>
<h2 id={sections['how-to-use'].id}>{sections['how-to-use'].name}</h2>
<section>
    <HowToUse />
</section>
<h2 id={sections.shortcuts.id}>{sections.shortcuts.name}</h2>
<section>
    <ShortcutsTable />
</section>
