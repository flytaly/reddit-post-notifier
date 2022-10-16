<script lang="ts">
    import { browser } from 'webextension-polyfill-ts';
    import RefreshIcon from '@assets/refresh.svg';
    import SettingsIcon from '@assets/settings.svg';
    import MailIcon from '@assets/mail.svg';
    import { sendToBg } from '@/port';
    import getMsg from '@/utils/get-message';
    import { isUpdating, storageData } from '../store/store';
    import SvgButton from './SvgButton.svelte';
    import { getInboxUrl } from '@/utils';
    import storage from '@/storage/storage';

    let loading = false;
    let messagesCount = 0;
    const inboxHref = getInboxUrl();

    $: loading = $isUpdating;
    $: {
        messagesCount = 0;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        Object.values($storageData.accounts || {})?.forEach((a) => {
            messagesCount = a.mail?.messages?.length || 0;
        });
    }

    const onOptionClick = async () => {
        await browser.runtime.openOptionsPage();
        window.close();
    };

    const onMailClick = async () => {
        if (messagesCount) await storage.removeMessages();
    };
</script>

<header class="flex min-h-[1.2rem] items-center space-x-3 border-b border-skin-delimiter p-1">
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

    <a
        class="group flex gap-1 text-current"
        class:accent={messagesCount}
        on:click={onMailClick}
        title={getMsg('headerMailLink_title')}
        href={inboxHref}
    >
        {#if messagesCount}
            <span>{messagesCount}</span>
        {/if}
        <div class="h-4 w-5 group-hover:scale-110 group-active:scale-95">
            {@html MailIcon}
        </div>
    </a>

    <span class="flex items-center space-x-3">
        <SvgButton
            text={getMsg('headerOptionsBtn')}
            on:click={onOptionClick}
            title={getMsg('headerOptionsBtn_title')}
            w="1.1rem"
        >
            {@html SettingsIcon}
        </SvgButton>
    </span>
</header>

<style lang="postcss">
    .accent {
        @apply text-skin-accent;
    }
</style>
