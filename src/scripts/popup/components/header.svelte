<script>
    import SvgButton from './svg-button.svelte';
    import ArrowLeftIcon from '../assets/arrowhead-left.svg';
    import RefreshIcon from '../assets/refresh.svg';
    import MailIcon from '../assets/mail.svg';
    import SettingsIcon from '../assets/settings.svg';
    import { getMsg, getSearchQueryUrl, getSubredditUrl } from '../../utils';
    import { postMessage } from '../connect';
    import types from '../../types';
    import { route, ROUTES } from '../store/route';

    export let loading = false;
    export let queriesList = [];

    let isPostList = false;
    let currentRoute = ROUTES.WATCH_LIST;
    let subredditOrSearchId = null;
    let headerURL = '';
    let headerTitle = '';

    $: if (currentRoute === ROUTES.SEARCH_POSTS_LIST) {
        isPostList = true;
        const search = queriesList.find((s) => s.id === subredditOrSearchId);
        headerURL = getSearchQueryUrl(search?.query, search?.subreddit);
        headerTitle = search?.name || search?.query;
    } else if (currentRoute === ROUTES.SUBREDDIT_POSTS_LIST) {
        isPostList = true;
        headerURL = getSubredditUrl(subredditOrSearchId);
        headerTitle = `r/${subredditOrSearchId}`;
    } else {
        isPostList = false;
        headerURL = '';
        headerTitle = '';
    }

    route.subscribe(($route) => {
        currentRoute = $route.route;
        subredditOrSearchId = $route.id;
    });

    const onOptionClick = async () => {
        await browser.runtime.openOptionsPage();
        window.close();
    };
</script>

<style>
    header {
        display: flex;
        align-items: center;
        padding: 5px 4px 2px 4px;
        min-height: 23px;
        border-bottom: 1px solid var(--hover-border-color);
    }

    .left-buttons {
        display: flex;
        flex: 1;
        align-items: center;
    }
    .left-buttons > :global(*) {
        margin-right: 6px;
    }
    .right-buttons {
        display: flex;
        align-items: center;
    }
    .right-buttons > :global(*) {
        margin-left: 6px;
    }

    .subreddit-name {
        font-weight: bold;
        font-size: 1.05em;
        color: inherit;
    }
    .arrow-left :global(button) {
        width: 18px;
        height: 18px;
    }
    .arrow-left :global(svg) {
        width: 100%;
        height: 100%;
    }
    .arrow-left :global(button):focus,
    .arrow-left :global(button):hover {
        background-color: var(--hover-border-color);
    }
    .arrow-left :global(button):focus:active,
    .arrow-left :global(button):hover:active {
        background-color: var(--hover-bg-color2);
    }

    .loading :global(svg) {
        animation: spinner-animation 800ms linear infinite;
    }
    @keyframes spinner-animation {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>

<header>
    <span class="left-buttons">
        {#if isPostList}
            <span class="arrow-left">
                <SvgButton on:click={() => route.set({ route: ROUTES.WATCH_LIST, id: null })}>
                    {@html ArrowLeftIcon}
                </SvgButton>
            </span>

            <!-- Subreddit's name -->
            <a class="subreddit-name" href={headerURL} title={getMsg('headerSubredditName_title')}>{headerTitle}</a>
        {:else}
            <SvgButton
                disabled={loading}
                on:click={() => postMessage({ type: types.UPDATE_NOW })}
                title={getMsg('headerUpdateBtn_title')}>
                <span class:loading>
                    {@html RefreshIcon}
                </span>
            </SvgButton>
        {/if}
    </span>

    {#if !isPostList}
        <span class="right-buttons">
            <SvgButton href="https://reddit.com/message/inbox/" title={getMsg('headerMail_title')}>
                <span class="unread-number" />
                {@html MailIcon}
            </SvgButton>

            <SvgButton on:click={onOptionClick} title={getMsg('headerOptions_title')}>
                {@html SettingsIcon}
            </SvgButton>
        </span>
    {/if}
</header>
