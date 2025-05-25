<script lang='ts'>
    import getMsg from '@/utils/get-message';
    import AddButton from '@options/components/common/AddButton.svelte';
    import BlockDescription from '@options/components/common/BlockDescription.svelte';
    import { HelpCircleIcon, RefreshIcon2 } from '@options/lib/icons';
    import { storageData } from '@options/lib/store';
    import { tooltip } from '@options/lib/tooltip';
    import { flip } from 'svelte/animate';
    import { fade } from 'svelte/transition';
    import { subState } from './state.svelte';
    import SubredditInput from './SubredditInput.svelte';
</script>

<div>
    <BlockDescription>
        <span>{getMsg('optionSubredditsDescription')}</span>
        <span
            class='inline-flex items-center gap-1 text-skin-accent2'
            use:tooltip={{ content: getMsg('helpFiltersVsSearch'), allowHTML: true }}
        >
            <span>{getMsg('optionSubredditsDescriptionFiltersVsSearch')}</span>
            <div class='h-4 w-4'>
                {@html HelpCircleIcon}
            </div>
        </span>
    </BlockDescription>
    {#await subState.loadFromStorage() then}
        <div class='watch-item-grid text-xs' class:hidden={subState.state.length === 0}>
            <div class='px-2 font-medium'>{getMsg('optionWatchInputNameColumn')}</div>
            <div class='invisible flex font-normal'>
                <div class='mr-1 h-5 w-5'>{@html RefreshIcon2}</div>
                <span>{getMsg('optionsSubredditFetch')}</span>
            </div>
            <div class='w-12 text-center font-medium'>{getMsg('optionWatchInputActiveColumn')}</div>
            <div class='w-48'></div>
            <div class='w-14'></div>
            <div class='w-8'></div>
        </div>
        {#each subState.state as subOpts, index (subOpts.id)}
            <div class='mb-2' transition:fade|local={{ duration: 200 }} animate:flip={{ duration: 150 }}>
                <SubredditInput {index} subData={$storageData.subreddits[subOpts.id] || {}} />
            </div>
        {/each}
        <AddButton clickHandler={() => subState.addSubreddit()}>{getMsg('optionSubredditsAdd')}</AddButton>
    {/await}
</div>
