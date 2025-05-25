<script lang='ts'>
    import Pin from '@/assets/pin-outline.svg?raw';
    import type { RedditItem } from '@/reddit-api/reddit-types';
    import storage from '@/storage';
    import type { ExtensionOptions } from '@/types/extension-options';
    import { constructUrl, getItemTitle, idToUserIdx } from '@/utils';
    import getMsg from '@/utils/get-message';
    import type { PostGroup } from '@/utils/post-group';
    import { storageData } from '../../store/store';
    import CheckMarkButton from '../CheckMarkButton.svelte';
    import PostLink from './PostLink.svelte';
    import SvgButton from '../SvgButton.svelte';

    interface Props {
        group: PostGroup;
        post: RedditItem;
        colorId?: number;
    }

    let { group, post, colorId }: Props = $props();

    let options: ExtensionOptions = $derived($storageData.options);
    let href: string = $derived(constructUrl(post.data.permalink, options));

    const removePost = async (id: string) => {
        const itemId = group.id;
        switch (group.type) {
            case 'search':
                return storage.removePost({ id, searchId: itemId });
            case 'user': {
                const userIndex = idToUserIdx(itemId);
                if (userIndex == null)
                    return;
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

    const onPostOpen = async () => {
        if (options.delPostAfterBodyClick) {
            await removePost(post.data.id);
        }
    };

    const colorClasses = [
        'bg-skin-subreddit-bg1 text-skin-subreddit-text1',
        'bg-skin-subreddit-bg2 text-skin-subreddit-text2',
    ];

    let colorClass = $derived.by(() => colorClasses[colorId ?? 0]);

</script>

<div class='flex w-full items-center py-[0.125rem] pr-3' data-post-id={post.data.id}>
    <CheckMarkButton clickHandler={() => removePost(post.data.id)} title={getMsg('watchListItemCheckMark_title')} />
    <PostLink
        class='flex-grow px-1 py-[0.125rem] text-skin-link'
        {href}
        onOpen={onPostOpen}
        postId={post.data.id}
    >
        {#if group.isMultireddit}
            <span
                class={[
                    'mr-1 text-xs px-px py-[2px] rounded',
                    colorClass,
                ]}>
                {`r/${post.data.subreddit}`}
            </span>
        {/if}
        {getItemTitle(post)}
    </PostLink>
    <span data-keys-target='pin-post'>
        <SvgButton onclick={onPinClick} title={getMsg('watchListItemPin_title')}>
            {@html Pin}
        </SvgButton>
    </span>
</div>
