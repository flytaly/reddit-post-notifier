<script lang="ts">
    import { redditUrl, redditOldUrl } from '../../../utils';
    import SvgButton from './SvgButton.svelte';
    import CheckMarkButton from './CheckMarkButton.svelte';
    import Pin from '../../../assets/pin-outline.svg';
    import storage from '../../../storage';
    import type { ExtensionOptions } from '../../../types/extension-options';
    import type { RedditPost } from '../../../reddit-api/reddit-types';
    import getMsg from '../../../utils/get-message';
    import { browser } from 'webextension-polyfill-ts';
    import { storageData } from '../store/store';

    export let post: RedditPost;
    export let type = 'subreddit';
    export let subredditOrSearchId: string;

    let options: ExtensionOptions = $storageData.options;
    $: options = $storageData.options;

    const baseUrl = options.useOldReddit ? redditOldUrl : redditUrl;
    const href = `${baseUrl}${post.data.permalink}`;

    const removePost = async (id: string) => {
        if (type === 'search') {
            await storage.removePost({ id, searchId: subredditOrSearchId });
        } else {
            await storage.removePost({ id, subreddit: subredditOrSearchId });
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
        {post.data.title}</a
    >
    <span data-keys-target="pin-post">
        <SvgButton on:click={onPinClick} title={'Pin the post'}>
            {@html Pin}
        </SvgButton>
    </span>
</div>
