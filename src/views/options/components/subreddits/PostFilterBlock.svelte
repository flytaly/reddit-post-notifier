<script lang="ts">
    import { slide } from 'svelte/transition';
    import { quadOut } from 'svelte/easing';
    import AddIcon from '@assets/add.svg';
    import PostFilterFields from './PostFilterFields.svelte';
    import type { FilterRule } from '@/text-search/post-filter';

    export let ruleList: FilterRule[] = [[{ field: 'author', query: '' }]];
    export let saveInputs: () => void;
    export let subId: string;

    const addRule = () => {
        ruleList = [...ruleList, [{ field: 'title', query: '' }]];
    };
</script>

<div transition:slide={{ duration: 150, easing: quadOut }} class="w-full col-span-full space-y-2">
    <div class="ml-6">
        <div class="font-medium text-sm">Post filters</div>
        <div class="text-sm">Check if the subreddit's posts fit at least one of the rules below.</div>
    </div>
    <div class="flex flex-col">
        {#each ruleList as filterRule, index}
            <div class="connected-block">
                <PostFilterFields inputHandler={saveInputs} {subId} bind:filterRule />
            </div>
            {#if ruleList.length - 1 !== index}
                <div>OR</div>
            {/if}
        {/each}
    </div>
    <button
        class="ml-6 flex items-center rounded py-px p-1 bg-transparent  border-transparent hover:border-skin-accent2 text-skin-accent2"
        on:click={addRule}
    >
        <span class="w-4 h-4 mr-1">
            {@html AddIcon}
        </span>
        <div>add filter rule</div>
    </button>
</div>
