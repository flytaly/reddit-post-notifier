<script lang="ts">
    import type { PostFilterOptions } from '@/storage/storage-types';
    import type { FilterRule } from '@/text-search/post-filter';
    import { quadOut } from 'svelte/easing';
    import { slide } from 'svelte/transition';
    import { AddIcon } from '@/views/options/icons';
    import PostFilterFields from './PostFilterFields.svelte';

    export let ruleList: FilterRule[] = [[{ field: 'title', query: '' }]];

    export let saveInputs: (filter: PostFilterOptions) => void;
    export let subId: string;

    const commitChanges = () => {
        saveInputs({ rules: ruleList });
    };

    const addRule = () => {
        ruleList = [...ruleList, [{ field: 'title', query: '' }]];
    };

    const removeRule = (index: number) => {
        ruleList = ruleList.filter((_, i) => i !== index);
        commitChanges();
    };
</script>

<div transition:slide={{ duration: 150, easing: quadOut }} class="mt-2 w-full col-span-full space-y-2">
    <div class="ml-6">
        <div class="font-medium text-sm">Post filters</div>
        <div class="text-sm">
            Check if the subreddit's posts fit at least one of the rules below. Filter words in the title and post's
            text fields are case-insensitive and can be stemmed (dogs = dog).
        </div>
    </div>
    <div class="flex flex-col">
        {#each ruleList as filterRule, index}
            <div class="connected-block">
                <PostFilterFields
                    removeFilter={() => removeRule(index)}
                    {commitChanges}
                    {subId}
                    bind:filterRule
                    {index}
                />
            </div>
            {#if ruleList.length - 1 !== index}
                <div class="text-sm font-mono py-1">OR</div>
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
