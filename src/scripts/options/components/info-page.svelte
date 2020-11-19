<script>
    import { onMount } from 'svelte';
    import { routes } from '../route';

    onMount(() => {
        if (window.location.hash) document.body.querySelector(window.location.hash)?.scrollIntoView();
    });
</script>

<style>
</style>

<h1 id={routes.info.id}>Information</h1>
