<script lang="ts">
    import Pin from '@/assets/pin-outline.svg';
    import type { RedditItem } from '@/reddit-api/reddit-types';
    import storage from '@/storage';
    import type { ExtensionOptions } from '@/types/extension-options';
    import { constructUrl } from '@/utils';
    import getMsg from '@/utils/get-message';
    import browser from 'webextension-polyfill';
    import { getItemTitle, idToUserIdx } from '@/utils';
    import type { PostGroup } from '@/utils/post-group';
    import { storageData } from '../store/store';
    import CheckMarkButton from './CheckMarkButton.svelte';
    import SvgButton from './SvgButton.svelte';

    export let group: PostGroup;
    export let post: RedditItem;

    let options: ExtensionOptions = $storageData.options;
    let href: string;

    $: options = $storageData.options;
    $: href = constructUrl(post.data.permalink, options);

    const removePost = async (id: string) => {
        const itemId = group.id;
        switch (group.type) {
            case 'search':
                return storage.removePost({ id, searchId: itemId });
            case 'user': {
                const userIndex = idToUserIdx(itemId);
                if (userIndex == null) return;
                return storage.removeUserPost({ postId: id, userIndex });
            }
            case 'subreddit': {
                return storage.removePost({ id, subreddit: itemId });
            }
            case 'message': {
                return storage.removeMessage({ messageId: itemId });
            }
            default:
        }
    };

    const onPinClick = async (ev: MouseEvent) => {
        ev.stopPropagation();
        await storage.savePinnedPost(post);
        return removePost(post.data.id);
    };

    const onLinkClick = async () => {
        if (options.delPostAfterBodyClick) {
            await removePost(post.data.id);
        }
        await browser.tabs.create({ url: href, active: false });
    };
</script>

<div class="flex w-full items-center py-[0.125rem] pr-3" data-post-id={post.data.id}>
    <CheckMarkButton clickHandler={() => removePost(post.data.id)} title={getMsg('watchListItemCheckMark_title')} />
    <a
        class="flex-grow px-1 py-[0.125rem] text-skin-link"
        {href}
        data-keys-target="post-link"
        on:click|preventDefault|stopPropagation={onLinkClick}
        data-post-id={post.data.id}
    >
        {#if group.isMultireddit}
            <span class="mr-1 text-xs text-skin-text">{`r/${post.data.subreddit}`}</span>
        {/if}
        {getItemTitle(post)}</a
    >
    <span data-keys-target="pin-post">
        <SvgButton on:click={onPinClick} title={getMsg('watchListItemPin_title')}>
            {@html Pin}
        </SvgButton>
    </span>
</div>
