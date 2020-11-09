<script>
    import nprogress from 'nprogress';
    import { onMount } from 'svelte';
    import Header from './header.svelte';
    import Footer from './footer.svelte';
    import WatchList from './watch-list.svelte';
    import { state } from '../store/store';
    import storage from '../../storage';
    import handleKeydownEvent from '../handleKeys';

    let loading = false;
    let subreddits = {};
    let queries = {};
    let queriesList = [];
    let messages = {};
    const options = storage.getOptions();

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
        display: flex;
        flex: 1 1;
        justify-content: center;
        align-items: center;
        min-width: 200px;
        min-height: 50px;
        text-align: center;
    }
</style>

<Header {loading} messagesCount={messages.count} />

<main>
    {#await options}
        <p />
    {:then options}
        <WatchList {subreddits} {queries} {queriesList} expandWithItems={options.expandWithItems} />
    {:catch error}
        <p style="color: red">{error.message}</p>
    {/await}
</main>

<Footer />
