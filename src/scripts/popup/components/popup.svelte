<script>
    import nprogress from 'nprogress';
    import { onMount } from 'svelte';
    import Header from './header.svelte';
    import Footer from './footer.svelte';
    import Main from './main.svelte';
    import { state } from '../store/store';

    let loading = false;
    onMount(() => {
        nprogress.configure({ showSpinner: false });
    });

    state.subscribe(($state) => {
        loading = $state.isLoading;
    });
</script>

<style>
</style>

<Header {loading} />
<Main />
<Footer />
