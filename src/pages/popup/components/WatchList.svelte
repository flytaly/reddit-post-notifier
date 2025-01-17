<script lang='ts'>
    import Pin from '@/assets/pin.svg?raw';
    import type { StorageFields } from '@/storage/storage-types';
    import getMsg from '@/utils/get-message';
    import type { PostGroup } from '@/utils/post-group';
    import { getGroupItems, removePostsFromGroup } from '@/utils/post-group';
    import { onMount } from 'svelte';
    import type { SlideConfig } from '../helpers/transition';
    import { slideHorizontal } from '../helpers/transition';
    import { storageData } from '../store/store';
    import DropDownList from './DropDownList.svelte';
    import GroupTitle from './GroupTitle.svelte';
    import PinPostRow from './PinPostRow.svelte';
    import Row from './Row.svelte';

    interface Props {
        groupsWithPosts?: PostGroup[];
        groupsWithoutPosts?: PostGroup[];
    }

    let { groupsWithPosts = [], groupsWithoutPosts = [] }: Props = $props();
    let expanded = $state(new Set<string>());
    let data: StorageFields = $derived($storageData);

    onMount(() => {
        if (groupsWithPosts.length === 1) {
            expanded = new Set(groupsWithPosts.map(g => g.id));
            return;
        }
        expanded = new Set([
            ...expanded,
            ...groupsWithPosts.filter(g => g.size <= data.options.expandWithItems).map(g => g.id),
        ]);
    });

    let big = $derived(expanded.size > 0);

    const getToggleHandler = (id: string) => (e: MouseEvent) => {
        e.stopPropagation();
        if (expanded.has(id)) {
            expanded.delete(id);
            expanded = new Set(expanded);
        }
        else {
            expanded = new Set(expanded.add(id));
        }
    };

    const pinTransition = (node: Element, props: SlideConfig) => slideHorizontal(node, props);
    const postGroupTransition = (node: Element, props: SlideConfig) => slideHorizontal(node, props);
</script>

<div class='flex flex-col' class:big>
    <!-- PINNED POSTS BLOCK -->
    <div>
        {#if data.pinnedPostList.length}
            <DropDownList
                toggle={getToggleHandler('PINNED_POST_LIST')}
                items={data.pinnedPostList}
                isExpanded={expanded.has('PINNED_POST_LIST')}
                rowOutTransition={slideHorizontal}
            >
                {#snippet headerRow()}
                    <div class='flex w-full items-center p-1 pb-2 pr-4'>
                        <div class='mr-1 h-4 w-4'>{@html Pin}</div>
                        <span>{`Pinned posts (${data.pinnedPostList.length})`}</span>
                    </div>
                {/snippet}
                {#snippet listRow(item)}
                    <PinPostRow {item} />
                {/snippet}
            </DropDownList>
            <div class='delimiter'></div>
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
                {#snippet headerRow()}
                    <GroupTitle onCheck={() => removePostsFromGroup(g.id, g.type)} group={g} />
                {/snippet}
                {#snippet listRow(item)}
                    <Row group={g} {item} />
                {/snippet}
            </DropDownList>
        </div>
    {/each}
    {#if !groupsWithPosts.length}
        <div class='mx-auto my-4 text-skin-gray'>{getMsg('noPosts')}</div>
    {/if}

    <!-- EMPTY GROUPS -->
    {#if !data.options.hideEmptyGroups && groupsWithoutPosts.length}
        <div class='delimiter'></div>
        {#each groupsWithoutPosts as group (group.id)}
            <GroupTitle {group} disabled />
        {/each}
    {/if}
</div>

<style lang='postcss'>
    .big {
        @apply min-h-[19rem] min-w-[28rem];
    }

    .delimiter {
        @apply my-2 w-full border-t border-dashed border-skin-gray;
    }
</style>
