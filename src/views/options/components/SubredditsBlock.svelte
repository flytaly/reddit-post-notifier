<script lang="ts">
    import type { SubredditData, SubredditOpts } from '../../../storage/storage-types';
    import { generateId } from '../../../utils';
    import SubredditInput from './SubredditInput.svelte';

    export let subredditList: SubredditOpts[];
    export let subredditsData: SubredditData;

    if (!Array.isArray(subredditList)) subredditList = [];

    // type SubredditError = {
    //     error?: number;
    //     message?: string;
    //     subreddit: string;
    //     reason?: string;
    // };
    // const getErrSubreddit = (e: SubredditError) => `r/${e.subreddit}`;
    // const getErrMessage = (e: SubredditError) => {
    //     return `${e.error} ${e.message} ${e.reason ? '(' + e.reason + ')' : ''}`;
    // };

    const addNewSubreddit = () => {
        subredditList = [...subredditList, { id: generateId(), subreddit: '' }];
    };
    addNewSubreddit();
</script>

<div>
    {#each subredditList as subOpts (subOpts.id)}
        <SubredditInput {subOpts} />
    {/each}
</div>
