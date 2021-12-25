<script lang="ts">
    import type { RedditMessage } from '@/reddit-api/reddit-types';
    import storage from '@/storage';
    import type { ExtensionOptions } from '@/types/extension-options';
    import { getInboxUrl } from '@/utils';
    import getMsg from '@/utils/get-message';
    import { browser } from 'webextension-polyfill-ts';
    import type { PostGroup } from '../helpers/post-group';
    import { storageData } from '../store/store';
    import CheckMarkButton from './CheckMarkButton.svelte';

    export let group: PostGroup;
    export let item: RedditMessage;

    let options: ExtensionOptions = $storageData.options;
    $: options = $storageData.options;

    const href = getInboxUrl(options.useOldReddit);

    const removePost = async (messageId: string) => {
        await storage.removeMessage({ accId: group.id, messageId });
    };

    const onLinkClick = async () => {
        if (options.delPostAfterBodyClick) {
            await removePost(item.data.id);
        }
        await browser.tabs.create({ url: href, active: false });
    };
</script>

<div class="flex items-center w-full py-[0.125rem] pr-3" data-post-id={item.data.id}>
    <CheckMarkButton clickHandler={() => removePost(item.data.id)} title={getMsg('postListCheckMark_title')} />
    <a
        class="text-skin-link flex-grow px-1 py-[0.125rem]"
        {href}
        on:click|preventDefault|stopPropagation={onLinkClick}
        data-keys-target="post-link"
        data-post-id={item.data.id}
    >
        <span class="font-medium">{`/u/${item.data.author}`}</span>
        <span>{`: ${item.data.subject}`}</span>
    </a>
</div>
