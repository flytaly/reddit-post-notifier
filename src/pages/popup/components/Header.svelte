<script lang='ts'>
    import MailIcon from '@assets/mail.svg?raw';
    import OpenIcon from '@assets/open-in-new.svg?raw';
    import RefreshIcon from '@assets/refresh.svg?raw';
    import SettingsIcon from '@assets/settings.svg?raw';
    import browser from 'webextension-polyfill';
    import { isUpdating, storageData } from '../store/store';
    import SvgButton from './SvgButton.svelte';
    import type { PostGroup } from '@/utils/post-group';
    import getMsg from '@/utils/get-message';
    import { getInboxUrl } from '@/utils';
    import type { OpenGroupsPayload } from '@/types/message';
    import storage from '@/storage';
    import { sendMessage } from '@/messaging';

    export let groupsWithPosts: PostGroup[] = [];

    let loading = false;
    let messagesCount = 0;

    $: loading = $isUpdating;
    $: {
        messagesCount = $storageData.mail?.messages?.length || 0;
        Object.values($storageData.accounts || {})?.forEach((a) => {
            messagesCount += a.mail?.messages?.length || 0;
        });
    }

    const onOptionClick = async () => {
        await browser.runtime.openOptionsPage();
        window.close();
    };

    const onMailClick = async () => {
        if (messagesCount)
            await storage.removeAllMessages();
    };

    let disableOpenAll = false;
    const onOpenAll = async () => {
        const payload: OpenGroupsPayload = {
            groups: groupsWithPosts,
            remove: $storageData.options.delListAfterOpening,
        };
        void sendMessage('OPEN_GROUPS', payload);
        setTimeout(() => {
            disableOpenAll = true;
        }, 1000);
    };

    const updateNow = async () => {
        await sendMessage('UPDATE_NOW');
    };
</script>

<header class='flex min-h-[1.2rem] items-center justify-between space-x-3 border-b border-skin-delimiter p-1'>
    <SvgButton
        disabled={loading}
        on:click={updateNow}
        title={getMsg('headerUpdateBtn_title')}
        text={loading ? 'updating' : 'update'}
    >
        <span class={`flex ${loading ? 'animate-spin' : ''}`}>
            {@html RefreshIcon}
        </span>
    </SvgButton>

    <SvgButton
        on:click={onOpenAll}
        text='open all'
        title='Open all unread items'
        disabled={groupsWithPosts.length === 0 || disableOpenAll}
    >
        {@html OpenIcon}
    </SvgButton>

    <span class='flex items-center space-x-2'>
        <a
            class='group flex items-center gap-1 text-current'
            class:accent={messagesCount}
            on:click={onMailClick}
            title={getMsg('headerMailLink_title')}
            href={getInboxUrl($storageData.options)}
        >
            <span>{messagesCount || ''}</span>
            <div class='h-5 w-5 group-hover:scale-110 group-active:scale-95'>
                {@html MailIcon}
            </div>
        </a>
        <SvgButton
            text={getMsg('headerOptionsBtn')}
            on:click={onOptionClick}
            title={getMsg('headerOptionsBtn_title')}
            w='1.1rem'
        >
            {@html SettingsIcon}
        </SvgButton>
    </span>
</header>

<style lang='postcss'>
    .accent {
        @apply text-skin-accent;
    }
</style>
