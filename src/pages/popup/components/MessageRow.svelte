<script lang='ts'>
    import type { RedditMessage } from '@/reddit-api/reddit-types';
    import storage from '@/storage';
    import type { ExtensionOptions } from '@/types/extension-options';
    import { getInboxUrl } from '@/utils';
    import getMsg from '@/utils/get-message';
    import type { PostGroup } from '@/utils/post-group';
    import browser from 'webextension-polyfill';
    import { storageData } from '../store/store';
    import CheckMarkButton from './CheckMarkButton.svelte';

    interface Props {
        group: PostGroup;
        item: RedditMessage;
    }

    let { group, item }: Props = $props();

    let options: ExtensionOptions = $derived($storageData.options);
    let href: string = $derived(getInboxUrl(options));

    const removePost = async (messageId: string) => {
        const accId = group.type === 'account-message' ? group.id : undefined;
        await storage.removeMessage({ accId, messageId });
    };

    const onLinkClick = async (ev: MouseEvent) => {
        ev.preventDefault();
        ev.stopPropagation();
        if (options.delPostAfterBodyClick)
            await removePost(item.data.id);

        await browser.tabs.create({ url: href, active: false });
    };
</script>

<div class='flex w-full items-center py-[0.125rem] pr-3' data-post-id={item.data.id}>
    <CheckMarkButton clickHandler={() => removePost(item.data.id)} title={getMsg('watchListItemCheckMark_title')} />
    <a
        class='flex-grow px-1 py-[0.125rem] text-skin-link'
        {href}
        onclick={onLinkClick}
        data-keys-target='post-link'
        data-post-id={item.data.id}
    >
        <span class='font-medium'>{`/u/${item.data.author}`}</span>
        <span>{`: ${item.data.subject}`}</span>
    </a>
</div>
