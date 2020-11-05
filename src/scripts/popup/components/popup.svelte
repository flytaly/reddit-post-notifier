<script>
    import nprogress from 'nprogress';
    import { onMount } from 'svelte';
    import Header from './header.svelte';
    import Footer from './footer.svelte';
    import WatchList from './watch-list.svelte';
    import PostList from './post-list.svelte';
    import { state } from '../store/store';
    import { route, ROUTES } from '../store/route';
    import Container from './container.svelte';
    import handleKeydownEvent from '../handleKeys';

    let loading = false;
    let subreddits = {};
    let queries = {};
    let queriesList = [];
    let messages = {};

    let currentRoute = ROUTES.WATCH_LIST;
    let subredditOrSearchId = null;
    let posts = [];

    $: if (currentRoute === ROUTES.SUBREDDIT_POSTS_LIST) {
        posts = subreddits[subredditOrSearchId].posts;
    } else if (currentRoute === ROUTES.SEARCH_POSTS_LIST) {
        posts = queries[subredditOrSearchId].posts;
    } else {
        posts = [];
    }

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

    route.subscribe((_route) => {
        currentRoute = _route.route;
        subredditOrSearchId = _route.id;
    });
</script>

<style>
    main {
        flex: 1 1;
    }
</style>

<Container big={currentRoute !== ROUTES.WATCH_LIST}>
    <Header {loading} {queriesList} messagesCount={messages.count} />

    <main>
        {#if currentRoute !== ROUTES.WATCH_LIST}
            <PostList {posts} {currentRoute} {subredditOrSearchId} />
        {:else}
            <WatchList {subreddits} {queries} {queriesList} />
        {/if}
    </main>

    <Footer {currentRoute} {subredditOrSearchId} />
</Container>
