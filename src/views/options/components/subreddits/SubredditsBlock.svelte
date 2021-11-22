<script lang="ts">
    import getMsg from '@/utils/get-message';
    import { AddIcon } from '@/views/options/icons';
    import { flip } from 'svelte/animate';
    import { fade } from 'svelte/transition';
    import { storageData } from '../../../popup/store/store';
    import SubredditInput from './SubredditInput.svelte';
    import { subredditStore } from './subreddits-store';
</script>

<div>
    <div class=" mb-4 text-sm">
        Monitor every post in a subreddit. You can filter posts based on given rule. In general, it's recommended to use
        Reddit Search instead of filters. <a href="#info">Read more on help page</a>.
    </div>
    <div class="grid-header">
        <div>Subreddit name</div>
        <div>Active</div>
        <div />
        <div />
        <div />
    </div>
    {#each $subredditStore as subOpts (subOpts.id)}
        <div class="mb-1" transition:fade|local={{ duration: 200 }} animate:flip={{ delay: 230, duration: 150 }}>
            <SubredditInput bind:subOpts subData={$storageData.subreddits[subOpts.id] || {}} />
        </div>
    {/each}
    <button
        class="flex items-center rounded p-1 bg-transparent  border-transparent hover:border-skin-accent2 text-skin-accent2"
        on:click={subredditStore.addSubreddit}
    >
        <span class="w-5 h-5 mr-1">
            {@html AddIcon}
        </span>
        <div>{getMsg('optionSubredditsAdd')}</div>
    </button>
</div>

<style lang="postcss">
    .grid-header {
        @apply grid p-1 items-start gap-x-3 w-full font-bold;

        grid-template-columns: minmax(10rem, 20rem) 3rem 4rem 4rem 2rem;
    }
</style>
