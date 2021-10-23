<script lang="ts">
    import type { RedditError } from '../../../reddit-api/reddit-types';
    import storage from '../../../storage';
    import type { SubredditData, SubredditOpts } from '../../../storage/storage-types';
    import { generateId } from '../../../utils';
    import SubredditInput from './SubredditInput.svelte';
    import AddIcon from '../../../assets/add.svg';

    export let subredditList: SubredditOpts[];
    export let subredditsData: Record<string, SubredditData>;

    if (!Array.isArray(subredditList)) subredditList = [];

    const formatError = (e: RedditError) =>
        e ? `The latest fetch error: ${e.error} ${e.message} ${e.reason ? '(' + e.reason + ')' : ''}` : '';

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
        <SubredditInput {subOpts} error={formatError(subredditsData[subOpts.id]?.error)} {deleteHandler} />
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
