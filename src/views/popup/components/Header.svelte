<script lang="ts">
    import { browser } from 'webextension-polyfill-ts';
    import MailIcon from '../../../assets/mail.svg';
    import RefreshIcon from '../../../assets/refresh.svg';
    import SettingsIcon from '../../../assets/settings.svg';
    import { sendToBg } from '../../../port';
    import storage from '../../../storage';
    import type { ExtensionOptions } from '../../../types/extension-options';
    import { redditOldUrl, redditUrl } from '../../../utils';
    import getMsg from '../../../utils/get-message';
    import { isUpdating, storageData } from '../store/store';
    import SvgButton from './SvgButton.svelte';

    export let messagesCount = 0;

    let loading = false;
    $: loading = $isUpdating;

    const options: ExtensionOptions = $storageData.options;

    const baseUrl = options.useOldReddit ? redditOldUrl : redditUrl;
    const inboxHref = `${baseUrl}/message/inbox/`;

    const onOptionClick = async () => {
        await browser.runtime.openOptionsPage();
        window.close();
    };
</script>

<header class="flex items-center p-1 min-h-[1.2rem] border-b border-skin-delimiter">
    <span class="flex flex-1 items-center space-x-2">
        <SvgButton
            disabled={loading}
            on:click={() => sendToBg('UPDATE_NOW')}
            title={getMsg('headerUpdateBtn_title')}
            text={loading ? 'updating' : 'update'}
        >
            <span class={`flex ${loading ? 'animate-spin' : ''}`}>
                {@html RefreshIcon}
            </span>
        </SvgButton>
    </span>

    <span class="flex items-center space-x-2">
        <span class="flex text-skin-accent">
            {#if messagesCount}
                <a href={inboxHref} class="mr-1 text-skin-accent" title={getMsg('headerMail_title')}>{messagesCount}</a>
            {/if}
            <SvgButton
                href={inboxHref}
                title={getMsg('headerMail_title')}
                on:click={() => void storage.removeMessages()}
            >
                <span class={`${messagesCount ? 'text-skin-accent' : 'text-skin-base'}`}>
                    {@html MailIcon}
                </span>
            </SvgButton>
        </span>
        <SvgButton on:click={onOptionClick} title={getMsg('headerOptions_title')}>
            {@html SettingsIcon}
        </SvgButton>
    </span>
</header>
