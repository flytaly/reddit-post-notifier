<script>
    import nprogress from 'nprogress';
    import { onMount, setContext } from 'svelte';
    import Header from './header.svelte';
    import Footer from './footer.svelte';
    import WatchList from './watch-list.svelte';
    import { state } from '../store/store';
    import handleKeydownEvent from '../handleKeys';
    import { getMsg } from '../../utils';

    let loading = false;
    let subreddits = {};
    let queries = {};
    let queriesList = [];
    let subredditList = [];
    let pinnedPostList = [];
    let messages = {};
    export let options;

    setContext('OPTIONS', options);

    onMount(() => {
        nprogress.configure({ showSpinner: false });
        document.addEventListener('keydown', handleKeydownEvent);
        return () => {
            document.removeEventListener('keydown', handleKeydownEvent);
        };
    });

    state.subscribe((_state) => {
        pinnedPostList = _state.pinnedPostList;
        loading = _state.isLoading;
        subredditList = _state.subredditList;
        subreddits = _state.subreddits;
        queries = _state.queries;
        queriesList = _state.queriesList;
        messages = _state.messages;
    });
</script>

<style>
    main {
        display: flex;
        flex-direction: column;
        flex: 1 1;
        justify-content: center;
        align-items: center;
        min-width: 200px;
        min-height: 50px;
    }
    .no-posts {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--grey);
        padding: 5px 0;
        height: 100%;
        min-width: 200px;
    }
</style>

<Header {loading} messagesCount={messages.count} />
<main>
    {#if queriesList.length || subredditList.length || pinnedPostList.length}
        <WatchList {subreddits} {queries} {queriesList} {subredditList} {pinnedPostList} />
    {:else}
        <div class="no-posts">{getMsg('noPosts')}</div>
    {/if}
</main>
<Footer />
