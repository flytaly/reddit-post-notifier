<script>
    import nprogress from 'nprogress';
    import { onMount } from 'svelte';
    import Header from './header.svelte';
    import Footer from './footer.svelte';
    import WatchList from './watch-list.svelte';
    import { state } from '../store/store';
    import { route, ROUTES } from '../store/route';

    let loading = false;
    let subreddits = {};
    let queries = {};
    let queriesList = [];

    let currentRoute = ROUTES.WATCH_LIST;
    let subredditOrSearchId = null;

    onMount(() => {
        nprogress.configure({ showSpinner: false });
    });

    state.subscribe(($state) => {
        loading = $state.isLoading;
        subreddits = $state.subreddits;
        queries = $state.queries;
        queriesList = $state.queriesList;
    });
    route.subscribe(($route) => {
        currentRoute = $route.route;
        subredditOrSearchId = $route.id;
    });
</script>

<style>
</style>

<Header {loading} />

{#if currentRoute !== ROUTES.WATCH_LIST}
    <main>{currentRoute}</main>
{:else}
    <WatchList {subreddits} {queries} {queriesList} />
{/if}

<Footer />
