<script>
    import nprogress from 'nprogress';
    import { onMount } from 'svelte';
    import Header from './header.svelte';
    import Footer from './footer.svelte';
    import Main from './main.svelte';
    import { state } from '../store/store';

    let loading = false;
    let subreddits = {};
    let queries = {};
    let queriesList = [];

    onMount(() => {
        nprogress.configure({ showSpinner: false });
    });

    state.subscribe(($state) => {
        loading = $state.isLoading;
        subreddits = $state.subreddits;
        queries = $state.queries;
        queriesList = $state.queriesList;
    });
</script>

<style>
</style>

<Header {loading} />
<Main {subreddits} {queries} {queriesList} />
<Footer />
