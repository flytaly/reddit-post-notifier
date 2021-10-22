<script lang="ts">
    import type { RedditPost } from '../../../reddit-api/reddit-types';

    import storage from '../../../storage';
    import type { StorageFields } from '../../../storage/storage-types';
    import getMsg from '../../../utils/get-message';
    import type { PostGroup, PostGroupType } from '../helpers/post-group';
    import { extractPostGroups } from '../helpers/post-group';
    import { slideHorizontal } from '../helpers/transition';
    import type { SlideConfig } from '../helpers/transition';
    import { storageData } from '../store/store';
    import DropDownList from './DropDownList.svelte';
    import GroupTitle from './GroupTitle.svelte';
    import PostRow from './PostRow.svelte';
    import Pin from '../../../assets/pin.svg';
    import PinPostRow from './PinPostRow.svelte';

    let groupsWithPosts: PostGroup[] = [];
    let groupsWithoutPosts: PostGroup[] = [];
    let expanded = new Set();
    let initialLoading = true;
    let data: StorageFields;

    $: data = $storageData;
    $: ({ groupsWithPosts, groupsWithoutPosts } = extractPostGroups(data));

    $: if (initialLoading) {
        if (groupsWithPosts.length === 1) {
            expanded = new Set(groupsWithPosts.map((g) => g.id));
        } else {
            expanded = new Set([
                ...expanded,
                ...groupsWithPosts.filter((g) => g.size <= data.options.expandWithItems).map((g) => g.id),
            ]);
        }
        if (expanded.size) initialLoading = false;
    }

    let big = false;
    $: big = big || Boolean(expanded.size);

    const getToggleHandler = (id: string) => (e: MouseEvent) => {
        e.stopPropagation();
        if (expanded.has(id)) {
            expanded.delete(id);
            expanded = new Set(expanded);
        } else {
            expanded = new Set(expanded.add(id));
        }
    };

    const getGroupItems = (id: string, type: PostGroupType): RedditPost[] => {
        if (type === 'subreddit') {
            return data.subreddits[id].posts;
        }
        if (type === 'search') {
            return data.queries[id].posts;
        }
        return [];
    };

    const getOnCheckHandler = (id: string, type: PostGroupType) => () => {
        void storage.removePostsFrom(type === 'subreddit' ? { subredditId: id } : { searchId: id });
    };

    const pinTransition = (node: Element, props: SlideConfig) => slideHorizontal(node, props);
    //     props.id && props.id === getId() //
    //         ? slideVertical(node, pinContainer.getBoundingClientRect().bottom, props)
    //         : slideHorizontal(node, props);

    const postGroupTransition = (node: Element, props: SlideConfig) => slideHorizontal(node, props);
</script>

<div class="flex flex-col" class:big>
    <!-- PINNED POSTS BLOCK -->
    <div>
        {#if data.pinnedPostList.length}
            <DropDownList
                toggle={getToggleHandler('PINNED_POST_LIST')}
                items={data.pinnedPostList}
                isExpanded={expanded.has('PINNED_POST_LIST')}
                rowOutTransition={slideHorizontal}
            >
                <div slot="header-row">
                    <div class="flex items-center w-full p-1 pr-4 pb-2">
                        <div class="w-4 h-4 mr-1">{@html Pin}</div>
                        <span>{`Pinned posts (${data.pinnedPostList.length})`}</span>
                    </div>
                </div>
                <div slot="list-row" let:item>
                    <PinPostRow post={item} />
                </div>
            </DropDownList>
            <div class="delimiter" />
        {/if}
    </div>

    <!-- UNREAD POSTS BLOCK -->
    {#each groupsWithPosts as { type, id, href, title } (id)}
        <div out:postGroupTransition={{ duration: 150 }}>
            <DropDownList
                toggle={getToggleHandler(id)}
                items={getGroupItems(id, type)}
                isExpanded={expanded.has(id)}
                rowOutTransition={pinTransition}
            >
                <div slot="header-row">
                    <GroupTitle onCheck={getOnCheckHandler(id, type)} {href} {title} />
                </div>
                <div slot="list-row" let:item>
                    <PostRow post={item} {type} subredditOrSearchId={id} />
                </div>
            </DropDownList>
        </div>
    {/each}
    {#if !groupsWithPosts.length}
        <div class="text-skin-gray my-4 mx-auto">{getMsg('noPosts')}</div>
    {/if}

    <!-- EMPTY GROUPS -->
    {#if !data.options.hideEmptyGroups && groupsWithoutPosts.length}
        <div class="delimiter" />
        {#each groupsWithoutPosts as { href, title }}
            <GroupTitle {href} {title} disabled />
        {/each}
    {/if}
</div>

<style lang="postcss">
    .big {
        @apply min-h-[19rem] min-w-[25rem];
    }

    .delimiter {
        @apply border-t border-skin-gray border-dashed w-full my-2;
    }
</style>
