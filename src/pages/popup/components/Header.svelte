<script lang="ts">
    import { browser } from 'webextension-polyfill-ts';
    import RefreshIcon from '@assets/refresh.svg';
    import SettingsIcon from '@assets/settings.svg';
    import OpenIcon from '@assets/open-in-new.svg';
    import MailIcon from '@assets/mail.svg';
    import { sendToBg } from '@/port';
    import getMsg from '@/utils/get-message';
    import { isUpdating, storageData } from '../store/store';
    import SvgButton from './SvgButton.svelte';
    import { getInboxUrl } from '@/utils';
    import storage from '@/storage/storage';
    import { extractPostGroups, removePostsFromGroup } from '../helpers/post-group';

    let loading = false;
    let messagesCount = 0;
    const inboxHref = getInboxUrl();

    $: loading = $isUpdating;
    $: {
        messagesCount = 0;
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

    const onOpenAll = async () => {
        const data = $storageData;
        const { groupsWithPosts } = extractPostGroups(data);
        for (const group of groupsWithPosts) {
            if ($storageData.options.delListAfterOpening) {
                await removePostsFromGroup(group.id, group.type);
            }
            void browser.tabs.create({ url: group.href, active: false });
        }
    };
</script>

<header class="flex min-h-[1.2rem] items-center justify-between space-x-3 border-b border-skin-delimiter p-1">
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

    <SvgButton on:click={onOpenAll} text="open all" title="Open all items">
        {@html OpenIcon}
    </SvgButton>

    <span class="flex items-center space-x-2">
        <a
            class="group flex items-center gap-1 text-current"
            class:accent={messagesCount}
            on:click={onMailClick}
            title={getMsg('headerMailLink_title')}
            href={inboxHref}
        >
            <span>{messagesCount || ''}</span>
            <div class="h-5 w-5 group-hover:scale-110 group-active:scale-95">
                {@html MailIcon}
            </div>
        </a>
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
