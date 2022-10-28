<script lang="ts">
    import getMsg from '@/utils/get-message';
    import { flip } from 'svelte/animate';
    import { fade } from 'svelte/transition';
    import { storageData } from '@options/lib/store';
    import AddButton from '@options/components/common/AddButton.svelte';
    import BlockDescription from '@options/components/common/BlockDescription.svelte';
    import SubredditInput from './SubredditInput.svelte';
    import { subredditStore } from './subreddits-store';
    import { HelpCircleIcon, RefreshIcon2 } from '@options/lib/icons';
    import { tooltip } from '@options/lib/tooltip';
</script>

<div>
    <BlockDescription>
        <span>{getMsg('optionSubredditsDescription')}</span>
        <span
            class="inline-flex items-center gap-1 text-skin-accent2"
            use:tooltip={{ content: getMsg('helpFiltersVsSearch'), allowHTML: true }}
        >
            Filters vs Reddit Search
            <div class="h-4 w-4">
                {@html HelpCircleIcon}
            </div>
        </span>
    </BlockDescription>
    <div class="watch-item-grid">
        <div class="px-2 font-medium">{getMsg('optionWatchInputNameColumn')}</div>
        <div class="invisible flex font-normal">
            <div class="mr-1 h-5 w-5">{@html RefreshIcon2}</div>
            <span>{getMsg('optionsSubredditFetch')}</span>
        </div>
        <div class="w-12 text-center font-medium">{getMsg('optionWatchInputActiveColumn')}</div>
        <div />
        <div />
        <div />
        <div />
    </div>
    {#each $subredditStore as subOpts (subOpts.id)}
        <div class="mb-2" transition:fade|local={{ duration: 200 }} animate:flip={{ delay: 230, duration: 150 }}>
            <SubredditInput bind:subOpts subData={$storageData.subreddits[subOpts.id] || {}} />
        </div>
    {/each}
    <AddButton clickHandler={subredditStore.addSubreddit}>{getMsg('optionSubredditsAdd')}</AddButton>
</div>
