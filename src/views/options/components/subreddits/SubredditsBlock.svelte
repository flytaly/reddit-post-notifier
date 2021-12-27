<script lang="ts">
    import getMsg from '@/utils/get-message';
    import { flip } from 'svelte/animate';
    import { fade } from 'svelte/transition';
    import { storageData } from '../../../popup/store/store';
    import AddButton from '../common/AddButton.svelte';
    import SubredditInput from './SubredditInput.svelte';
    import { subredditStore } from './subreddits-store';
</script>

<div>
    <div class=" mb-4 text-sm">
        <span>{getMsg('optionSubredditsDescription')}</span>
        <a href="#info">{getMsg('optionReadMore')}</a>
    </div>
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
        @apply grid p-1 items-start gap-x-3 w-full font-bold;

        grid-template-columns: minmax(10rem, 20rem) 3rem 4rem 4rem 2rem;
    }
</style>
