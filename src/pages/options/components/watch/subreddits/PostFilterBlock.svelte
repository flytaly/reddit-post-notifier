<script lang='ts'>
    import type { PostFilterOptions } from '@/storage/storage-types';
    import { allFields, type FilterRule } from '@/text-search/post-filter';
    import getMsg from '@/utils/get-message';
    import AddButton from '@options/components/common/AddButton.svelte';
    import { HelpCircleIcon } from '@options/lib/icons';
    import { tooltip } from '@options/lib/tooltip';
    import { quadOut } from 'svelte/easing';
    import { slide } from 'svelte/transition';
    import PostFilterFields from './PostFilterFields.svelte';
    import { subState } from './state.svelte';
    import './PostFilterBlock.pcss';

    interface Props {
        saveInputs: (filter: PostFilterOptions) => void;
        subId: string;
        subIndex: number;
    }

    let { subIndex, saveInputs, subId }: Props = $props();

    let ruleList = $state($state.snapshot(subState.state[subIndex])?.filterOpts?.rules || []);

    $effect(() => {
        ruleList = $state.snapshot(subState.state[subIndex])?.filterOpts?.rules || [];
    });

    const commitChanges = () => {
        saveInputs({ rules: $state.snapshot(ruleList) });
    };

    const addRule = () => {
        ruleList.push([{ field: 'title', query: '', queryType: 'positive' }]);
    };

    const removeRule = (ruleIndex: number) => {
        ruleList.splice(ruleIndex, 1);
        commitChanges();
    };

    const removeRuleField = (ruleIndex: number, index: number) => {
        if (ruleList[ruleIndex].length <= 1) ruleList.splice(ruleIndex, 1);
        else ruleList[ruleIndex].splice(index, 1);
        commitChanges();
    };

    const addRuleField = (ruleIndex: number) => {
        if (!ruleList[ruleIndex]) ruleList[ruleIndex] = [];
        ruleList[ruleIndex].push({ field: allFields[0], query: '', queryType: 'positive' });
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
                    addRuleField={() => addRuleField(ruleIndex)}
                    removeRuleField ={ (fieldIndex: number) => removeRuleField(ruleIndex, fieldIndex) }
                    removeFilter={() => removeRule(ruleIndex)}
                    onChange = {(r: FilterRule) => {
                        ruleList[ruleIndex] = r;
                        commitChanges();
                    }}
                    {subId}
                    filterRule={ruleList[ruleIndex]}
                    filterIdx={ruleIndex}
                />
            </div>
            {#if ruleList.length - 1 !== ruleIndex}
                <div class='py-1 font-mono text-sm'>OR</div>
            {/if}
        {/each}
    </div>
    <AddButton clickHandler={addRule}>add filter rule</AddButton>
</div>
