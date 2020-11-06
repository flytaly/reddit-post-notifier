<script>
    import nprogress from 'nprogress';
    import { onMount } from 'svelte';
    import Header from './header.svelte';
    import Footer from './footer.svelte';
    import WatchList from './watch-list.svelte';
    import { state } from '../store/store';
    import handleKeydownEvent from '../handleKeys';

    let loading = false;
    let subreddits = {};
    let queries = {};
    let queriesList = [];
    let messages = {};

    const subredditOrSearchId = null;
    onMount(() => {
        nprogress.configure({ showSpinner: false });
        document.addEventListener('keydown', handleKeydownEvent);
        return () => {
            document.removeEventListener('keydown', handleKeydownEvent);
        };
    });

    state.subscribe((_state) => {
        loading = _state.isLoading;
        subreddits = _state.subreddits;
        queries = _state.queries;
        queriesList = _state.queriesList;
        messages = _state.messages;
    });
</script>

<style>
    main {
        flex: 1 1;
    }
</style>

<Header {loading} {queriesList} messagesCount={messages.count} />

<main>
    <WatchList {subreddits} {queries} {queriesList} />
</main>

<Footer />
