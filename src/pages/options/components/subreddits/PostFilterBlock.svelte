<script lang="ts">
    import type { PostFilterOptions } from '@/storage/storage-types';
    import type { FilterRule } from '@/text-search/post-filter';
    import { quadOut } from 'svelte/easing';
    import { slide } from 'svelte/transition';
    import PostFilterFields from './PostFilterFields.svelte';
    import AddButton from '../common/AddButton.svelte';

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

<div transition:slide={{ duration: 150, easing: quadOut }} class="col-span-full mt-2 w-full space-y-2">
    <div class="ml-6">
        <div class="text-sm font-medium">Post filters</div>
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
                <div class="py-1 font-mono text-sm">OR</div>
            {/if}
        {/each}
    </div>
    <AddButton clickHandler={addRule}>add filter rule</AddButton>
</div>
