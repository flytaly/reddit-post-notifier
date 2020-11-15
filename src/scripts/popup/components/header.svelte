<script>
    import SvgButton from './svg-button.svelte';
    import RefreshIcon from '../assets/refresh.svg';
    import MailIcon from '../assets/mail.svg';
    import SettingsIcon from '../assets/settings.svg';
    import { getMsg } from '../../utils';
    import { postMessage } from '../connect';
    import types from '../../types';
    import storage from '../../storage';

    export let loading = false;
    export let messagesCount = 0;

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
    .unread-number {
        margin-right: 0.4em;
    }
    .unread :global(a),
    .unread :global(svg) {
        fill: var(--new-mail-color);
        color: var(--new-mail-color);
    }
    .update-icon {
        display: flex;
    }
</style>

<header>
    <span class="left-buttons">
        <SvgButton
            disabled={loading}
            on:click={() => postMessage({ type: types.UPDATE_NOW })}
            title={getMsg('headerUpdateBtn_title')}
            text={loading ? 'updating' : 'update'}>
            <span class:loading class="update-icon">
                {@html RefreshIcon}
            </span>
        </SvgButton>
    </span>

    <span class="right-buttons">
        <span class={messagesCount ? 'unread' : ''}>
            <SvgButton
                href="https://reddit.com/message/inbox/"
                title={getMsg('headerMail_title')}
                on:click={() => storage.removeMessages()}>
                {#if messagesCount}<span class="unread-number">{messagesCount} </span>{/if}
                {@html MailIcon}
            </SvgButton>
        </span>
        <SvgButton on:click={onOptionClick} title={getMsg('headerOptions_title')}>
            {@html SettingsIcon}
        </SvgButton>
    </span>
</header>
