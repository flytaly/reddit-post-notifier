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
    import DropDownList from './list/DropDownList.svelte';
    import GroupTitle from './GroupTitle.svelte';
    import PinPostRow from './list/PinPostRow.svelte';
    import Row from './list/Row.svelte';

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

{#snippet delimiter()}
    <div class='my-2 w-full border-t border-dashed text-skin-gray'></div>
{/snippet}

<div
    class={[
        'flex flex-col',
        { 'min-h-[19rem] min-w-[36rem]': big },
    ]}>
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
                        <span>Pinned posts</span>
                        <span class="rounded ml-1 text-xs border-1 px-0.5 min-w-[3ch] text-center text-skin-text border-skin-border/70">{data.pinnedPostList.length}</span>
                    </div>
                {/snippet}
                {#snippet listRow(item)}
                    <PinPostRow {item} />
                {/snippet}
            </DropDownList>
            {@render delimiter()}
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
                colorVariants={2}
            >
                {#snippet headerRow()}
                    <GroupTitle onCheck={() => removePostsFromGroup(g.id, g.type)} group={g} />
                {/snippet}
                {#snippet listRow(item, colorId)}
                    <Row group={g} {item} {colorId} />
                {/snippet}
            </DropDownList>
        </div>
    {/each}
    {#if !groupsWithPosts.length}
        <div class='mx-auto my-4 text-skin-gray'>{getMsg('noPosts')}</div>
    {/if}

    <!-- EMPTY GROUPS -->
    {#if !data.options.hideEmptyGroups && groupsWithoutPosts.length}
        {@render delimiter()}
        {#each groupsWithoutPosts as group (group.id)}
            <GroupTitle {group} disabled />
        {/each}
    {/if}
</div>
