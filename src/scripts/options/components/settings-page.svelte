<script>
    import { onMount } from 'svelte';
    import { routes } from '../route';

    onMount(() => {
        document.body.querySelector(window.location.hash)?.scrollIntoView();
    });
    const { sections } = routes.settings;
</script>

<style>
    .settings-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 100%;
    }
</style>

<div class="settings-container">
    <h1 id={routes.settings.id}>{routes.settings.name}</h1>
    <h2 id={sections.general.id}>{sections.general.name}</h2>
    <h2 id={sections.mail.id}>{sections.mail.name}</h2>
    <h2 id={sections.subreddit.id}>{sections.subreddit.name}</h2>
    <h2 id={sections['reddit-search'].id}>{sections['reddit-search'].name}</h2>
</div>
