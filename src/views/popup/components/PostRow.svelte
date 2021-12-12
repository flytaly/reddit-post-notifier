<script lang="ts">
    import Pin from '@/assets/pin-outline.svg';
    import type { RedditItem } from '@/reddit-api/reddit-types';
    import storage from '@/storage';
    import type { ExtensionOptions } from '@/types/extension-options';
    import { redditOldUrl, redditUrl } from '@/utils';
    import getMsg from '@/utils/get-message';
    import { browser } from 'webextension-polyfill-ts';
    import { getItemTitle, idToUserIdx } from '../helpers';
    import { storageData } from '../store/store';
    import CheckMarkButton from './CheckMarkButton.svelte';
    import SvgButton from './SvgButton.svelte';

    export let post: RedditItem;
    export let type: 'subreddit' | 'search' | 'user' = 'subreddit';
    export let itemId: string;
    export let showSubreddit = false;

    let options: ExtensionOptions = $storageData.options;
    $: options = $storageData.options;

    const baseUrl = options.useOldReddit ? redditOldUrl : redditUrl;
    const href = `${baseUrl}${post.data.permalink}`;

    const removePost = async (id: string) => {
        switch (type) {
            case 'search':
                return storage.removePost({ id, searchId: itemId });
            case 'user': {
                return storage.removeUserPost({ postId: id, userIndex: idToUserIdx(itemId) });
            }
            default:
                return storage.removePost({ id, subreddit: itemId });
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

<div class="flex items-center w-full py-[0.125rem] pr-3">
    <CheckMarkButton clickHandler={() => removePost(post.data.id)} title={getMsg('postListCheckMark_title')} />
    <a
        class="text-skin-link flex-grow px-1 py-[0.125rem]"
        {href}
        data-keys-target="post-link"
        on:click|preventDefault|stopPropagation={onLinkClick}
        data-post-id={post.data.id}
    >
        {#if showSubreddit}
            <span class="text-skin-text text-xs mr-1">{`r/${post.data.subreddit}`}</span>
        {/if}
        {getItemTitle(post)}</a
    >
    <span data-keys-target="pin-post">
        <SvgButton on:click={onPinClick} title={'Pin the post'}>
            {@html Pin}
        </SvgButton>
    </span>
</div>
