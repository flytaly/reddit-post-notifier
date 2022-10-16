<script lang="ts">
    import getMsg from '@/utils/get-message';
    import { flip } from 'svelte/animate';
    import { fade } from 'svelte/transition';
    import { storageData } from '@/pages/popup/store/store';
    import AddButton from '@options/components/common/AddButton.svelte';
    import BlockDescription from '@options/components/common/BlockDescription.svelte';
    import SubredditInput from './SubredditInput.svelte';
    import { subredditStore } from './subreddits-store';
</script>

<div>
    <BlockDescription>
        <span>{getMsg('optionSubredditsDescription')}</span>
        <a href="#info">{getMsg('optionReadMore')}</a>
    </BlockDescription>
    <div class="grid-header">
        <div>{getMsg('optionSubredditsName')}</div>
        <div>{getMsg('optionSubredditsActive')}</div>
        <div />
        <div />
        <div />
    </div>
    {#each $subredditStore as subOpts (subOpts.id)}
        <div class="mb-1" transition:fade|local={{ duration: 200 }} animate:flip={{ delay: 230, duration: 150 }}>
            <SubredditInput bind:subOpts subData={$storageData.subreddits[subOpts.id] || {}} />
        </div>
    {/each}
    <AddButton clickHandler={subredditStore.addSubreddit}>{getMsg('optionSubredditsAdd')}</AddButton>
</div>

<style lang="postcss">
    .grid-header {
        @apply grid w-full items-start gap-x-3 p-1 font-bold;

        grid-template-columns: minmax(10rem, 20rem) 3rem 4rem 4rem 2rem;
    }
</style>
