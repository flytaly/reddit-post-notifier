<script lang="ts">
    /* eslint-disable @typescript-eslint/no-unsafe-argument */
    import Pin from '@/assets/pin.svg?raw';
    import type { StorageFields } from '@/storage/storage-types';
    import getMsg from '@/utils/get-message';
    import { getGroupItems, removePostsFromGroup } from '@/utils/post-group';
    import type { PostGroup } from '@/utils/post-group';
    import type { SlideConfig } from '../helpers/transition';
    import { slideHorizontal } from '../helpers/transition';
    import { storageData } from '../store/store';
    import DropDownList from './DropDownList.svelte';
    import GroupTitle from './GroupTitle.svelte';
    import PinPostRow from './PinPostRow.svelte';
    import Row from './Row.svelte';

    export let groupsWithPosts: PostGroup[] = [];
    export let groupsWithoutPosts: PostGroup[] = [];

    let expanded = new Set<string>();
    let initialLoading = true;
    let data: StorageFields;

    $: data = $storageData;

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
                    <div class="flex w-full items-center p-1 pb-2 pr-4">
                        <div class="mr-1 h-4 w-4">{@html Pin}</div>
                        <span>{`Pinned posts (${data.pinnedPostList.length})`}</span>
                    </div>
                </div>
                <div slot="list-row" let:item>
                    <PinPostRow {item} />
                </div>
            </DropDownList>
            <div class="delimiter" />
        {/if}
    </div>

    <!-- UNREAD POSTS BLOCK -->
    {#each groupsWithPosts as g (g.id)}
        <div out:postGroupTransition={{ duration: 150 }}>
            <DropDownList
                toggle={getToggleHandler(g.id)}
                items={getGroupItems(data, g.id, g.type)}
                isExpanded={expanded.has(g.id)}
                rowOutTransition={pinTransition}
            >
                <div slot="header-row">
                    <GroupTitle onCheck={() => removePostsFromGroup(g.id, g.type)} group={g} />
                </div>
                <div slot="list-row" let:item>
                    <Row group={g} {item} />
                </div>
            </DropDownList>
        </div>
    {/each}
    {#if !groupsWithPosts.length}
        <div class="mx-auto my-4 text-skin-gray">{getMsg('noPosts')}</div>
    {/if}

    <!-- EMPTY GROUPS -->
    {#if !data.options.hideEmptyGroups && groupsWithoutPosts.length}
        <div class="delimiter" />
        {#each groupsWithoutPosts as group (group.id)}
            <GroupTitle {group} disabled />
        {/each}
    {/if}
</div>

<style lang="postcss">
    .big {
        @apply min-h-[19rem] min-w-[28rem];
    }

    .delimiter {
        @apply my-2 w-full border-t border-dashed border-skin-gray;
    }
</style>
