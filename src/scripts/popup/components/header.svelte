<script>
    import SvgButton from './svg-button.svelte';
    import ArrowLeftIcon from '../assets/arrowhead-left.svg';
    import RefreshIcon from '../assets/refresh.svg';
    import MailIcon from '../assets/mail.svg';
    import SettingsIcon from '../assets/settings.svg';

    export let isPostList = true;

    const { getMessage } = browser.i18n;

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
</style>

<header>
    <span class="left-buttons">
        {#if isPostList}
            <span class="arrow-left">
                <SvgButton>
                    {@html ArrowLeftIcon}
                </SvgButton>
            </span>

            <!-- Subreddit's name -->
            <a
                class="subreddit-name"
                href="https://reddit.com"
                title={getMessage('headerSubredditName_title')}>subreddit's name</a>
        {:else}
            <SvgButton title={getMessage('headerUpdateBtn_title')}>
                {@html RefreshIcon}
            </SvgButton>
        {/if}
    </span>

    {#if !isPostList}
        <span class="right-buttons">
            <SvgButton href="https://reddit.com/message/inbox/" title={getMessage('headerMail_title')}>
                <span class="unread-number" />
                {@html MailIcon}
            </SvgButton>

            <SvgButton onclick={onOptionClick} title={getMessage('headerOptions_title')}>
                {@html SettingsIcon}
            </SvgButton>
        </span>
    {/if}
</header>
