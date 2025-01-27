<script lang='ts'>
    import { sendMessage } from '@/messaging';
    import storage from '@/storage';
    import type { OpenGroupsPayload } from '@/types/message';
    import { getInboxUrl } from '@/utils';
    import getMsg from '@/utils/get-message';
    import type { PostGroup } from '@/utils/post-group';
    import MailIcon from '@assets/mail.svg?raw';
    import OpenIcon from '@assets/open-in-new.svg?raw';
    import RefreshIcon from '@assets/refresh.svg?raw';
    import SettingsIcon from '@assets/settings.svg?raw';
    import browser from 'webextension-polyfill';
    import { isUpdating, storageData } from '../store/store';
    import SvgButton from './SvgButton.svelte';

    interface Props {
        groupsWithPosts?: PostGroup[];
    }

    let { groupsWithPosts = [] }: Props = $props();

    let loading = $derived($isUpdating);

    let messagesCount = $derived.by(() => {
        let result = $storageData.mail?.messages?.length || 0;
        Object.values($storageData.accounts || {})?.forEach((a) => {
            result += a.mail?.messages?.length || 0;
        });
        return result;
    });

    const onOptionClick = async () => {
        await browser.runtime.openOptionsPage();
        window.close();
    };

    const onMailClick = async () => {
        if (messagesCount)
            await storage.removeAllMessages();
    };

    let disableOpenAll = $state(false);
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
        onclick={updateNow}
        title={getMsg('headerUpdateBtn_title')}
        text={loading ? 'updating' : 'update'}
    >
        <span class={`flex ${loading ? 'animate-spin' : ''}`}>
            {@html RefreshIcon}
        </span>
    </SvgButton>

    <SvgButton
        onclick={onOpenAll}
        text='open all'
        title='Open all unread items'
        disabled={groupsWithPosts.length === 0 || disableOpenAll}
    >
        {@html OpenIcon}
    </SvgButton>

    <span class='flex items-center space-x-2'>
        <a
            class={[
                'group flex items-center gap-1',
                messagesCount ? 'text-skin-accent' : 'text-current',
            ]}
            onclick={onMailClick}
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
            onclick={onOptionClick}
            title={getMsg('headerOptionsBtn_title')}
            w='1.1rem'
        >
            {@html SettingsIcon}
        </SvgButton>
    </span>
</header>
