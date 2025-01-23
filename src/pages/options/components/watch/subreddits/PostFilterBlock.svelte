<script lang='ts'>
    import { quadOut } from 'svelte/easing';
    import { slide } from 'svelte/transition';
    import AddButton from '@options/components/common/AddButton.svelte';
    import { HelpCircleIcon } from '@options/lib/icons';
    import { tooltip } from '@options/lib/tooltip';
    import PostFilterFields from './PostFilterFields.svelte';
    import getMsg from '@/utils/get-message';
    import type { PostFilterOptions } from '@/storage/storage-types';
    import { allFields } from '@/text-search/post-filter';
    import { subState } from './state.svelte';

    interface Props {
        saveInputs: (filter: PostFilterOptions) => void;
        subId: string;
        index: number;
    }

    let { index: stateIdx, saveInputs, subId }: Props = $props();

    let ruleList = $state(subState.state[stateIdx]?.filterOpts?.rules || []);

    $effect(() => {
        ruleList = subState.state[stateIdx]?.filterOpts?.rules || [];
    });

    const commitChanges = () => {
        saveInputs({ rules: $state.snapshot(ruleList) });
    };

    const addRule = () => {
        ruleList.push([{ field: 'title', query: '' }]);
    };

    const removeRule = (ruleIndex: number) => {
        ruleList = ruleList.filter((_, i) => i !== ruleIndex);
        commitChanges();
    };

    const removeRuleField = (index: number) => {
        let filterRule = ruleList[stateIdx];
        if (filterRule.length > 1)
            filterRule = filterRule.filter((_, i) => i !== index);
        else
            filterRule = [{ field: allFields[0], query: '', queryType: 'positive' }];
        ruleList[stateIdx] = filterRule;
        commitChanges();
    };

    const addRuleField = () => {
        if (!ruleList[stateIdx]) ruleList[stateIdx] = [];
        ruleList[stateIdx].push({ field: allFields[0], query: '', queryType: 'positive' });
        commitChanges();
    };
</script>

<div transition:slide={{ duration: 150, easing: quadOut }} class='w-full space-y-2'>
    <div class='ml-6'>
        <div class='text-sm font-medium'>Post filters</div>
        <div class='text-sm'>
            <span>
                Check if the subreddit's posts fit at least one of the rules below. Filter words in the title and post's
                text fields are case-insensitive and can be stemmed (dogs = dog).
            </span>
            <span
                class='inline-flex items-center gap-1 text-skin-accent2'
                use:tooltip={{ content: getMsg('helpFiltersVsSearch'), allowHTML: true }}
            >
                Filters vs Reddit Search
                <div class='h-4 w-4'>
                    {@html HelpCircleIcon}
                </div>
            </span>
        </div>
    </div>
    <div class='flex flex-col'>
        <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
        {#each ruleList as _filterRule, ruleIndex}
            <div class='connected-block'>
                <PostFilterFields
                    {addRuleField}
                    {removeRuleField}
                    removeFilter={() => removeRule(ruleIndex)}
                    {commitChanges}
                    {subId}
                    filterRule={ruleList[ruleIndex]}
                    filterIdx={ruleIndex}
                />
            </div>
            {#if ruleList.length - 1 !== stateIdx}
                <div class='py-1 font-mono text-sm'>OR</div>
            {/if}
        {/each}
    </div>
    <AddButton clickHandler={addRule}>add filter rule</AddButton>
</div>
