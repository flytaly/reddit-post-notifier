<script lang="ts">
    import { flip } from 'svelte/animate';
    import { fade } from 'svelte/transition';
    import AddIcon from '../../../assets/add.svg';
    import type { RedditError } from '../../../reddit-api/reddit-types';
    import storage from '../../../storage';
    import type { SubredditData, SubredditOpts } from '../../../storage/storage-types';
    import { generateId } from '../../../utils';
    import SubredditInput from './SubredditInput.svelte';

    export let subredditList: SubredditOpts[];
    export let subredditsData: Record<string, SubredditData>;

    if (!Array.isArray(subredditList)) subredditList = [];

    const formatError = (e: RedditError) =>
        e ? `Error during the latest fetch: ${e.error} ${e.message} ${e.reason ? '(' + e.reason + ')' : ''}` : '';

    const addNewSubreddit = () => {
        subredditList = [...subredditList, { id: generateId(), subreddit: '' }];
    };
    addNewSubreddit();

    const deleteHandler = async (id) => {
        await storage.removeSubreddits([id]);
        subredditList = subredditList.filter((s) => s.id !== id);
    };
</script>

<div>
    {#each subredditList as subOpts (subOpts.id)}
        <div class="mb-1" transition:fade|local={{ duration: 200 }} animate:flip={{ delay: 230, duration: 150 }}>
            <SubredditInput {subOpts} error={formatError(subredditsData[subOpts.id]?.error)} {deleteHandler} />
        </div>
    {/each}
    <button
        class="flex items-center rounded p-1 bg-transparent  border-transparent hover:border-skin-accent2 text-skin-accent2"
        on:click={addNewSubreddit}
    >
        <span class="w-5 h-5 mr-1">
            {@html AddIcon}
        </span>
        <div>Add new subreddit</div>
    </button>
</div>
