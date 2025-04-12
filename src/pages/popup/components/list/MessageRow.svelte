<script lang='ts'>
    import type { RedditMessage } from '@/reddit-api/reddit-types';
    import storage from '@/storage';
    import type { ExtensionOptions } from '@/types/extension-options';
    import { getInboxUrl } from '@/utils';
    import getMsg from '@/utils/get-message';
    import type { PostGroup } from '@/utils/post-group';
    import { storageData } from '../../store/store';
    import CheckMarkButton from '../CheckMarkButton.svelte';
    import PostLink from './PostLink.svelte';

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

    const onOpen = async () => {
        if (options.delPostAfterBodyClick) await removePost(item.data.id);
    };
</script>

<div class='flex w-full items-center py-[0.125rem] pr-3' data-post-id={item.data.id}>
    <CheckMarkButton clickHandler={() => removePost(item.data.id)} title={getMsg('watchListItemCheckMark_title')} />
    <PostLink
        class='flex-grow px-1 py-[0.125rem] text-skin-link'
        {href}
        onOpen={onOpen}
        postId={item.data.id}
    >
        <span class='font-medium'>{`/u/${item.data.author}`}</span>
        <span>{`: ${item.data.subject}`}</span>
    </PostLink>
</div>
