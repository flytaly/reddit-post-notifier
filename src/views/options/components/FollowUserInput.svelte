<script lang="ts">
    import { updateFollowingUser } from '@/background/app';
    import type { FollowingUser } from '@/storage/storage-types';
    import getMsg from '@/utils/get-message';
    import * as icons from '@/views/options/icons';
    import type { RedditCommentData, RedditPostData } from '../../../reddit-api/reddit-types';
    import { isBlocked } from '../store';

    export let userInfo: FollowingUser;
    export let commitChanges: () => void;
    export let onDelete: () => void;

    let username: string = userInfo.username;
    let inputSaved = true;
    let comments = true;
    let posts = true;

    $: if (userInfo.username !== username && inputSaved) {
        username = userInfo.username;
    }

    $: switch (userInfo.watch) {
        case 'comments':
            comments = true;
            posts = false;
            break;
        case 'submitted':
            comments = false;
            posts = true;
            break;
        default:
            comments = true;
            posts = true;
    }

    const saveWatchTarget = () => {
        if (posts) userInfo.watch = 'submitted';
        if (comments) userInfo.watch = 'comments';
        if (comments && posts) userInfo.watch = 'overview';
        else if (!comments && !posts) userInfo.watch = userInfo.watch === 'comments' ? 'submitted' : 'comments';
        userInfo = { ...userInfo, lastUpdate: null, lastPostCreated: null, data: [] };
        commitChanges();
    };

    const saveUsername = () => {
        inputSaved = true;
        showUserData = false;
        username = username.replace(/\s/g, '');
        userInfo = { ...userInfo, username, error: null, lastUpdate: null, lastPostCreated: null, data: [] };
        // userInfo.username = username;
        commitChanges();
    };

    let saveBtnMessage = '';

    $: if (!username) saveBtnMessage = ' ';
    else saveBtnMessage = username === userInfo.username || inputSaved ? 'saved' : 'save';

    let errorMsg = '';

    $: if (userInfo.error) {
        errorMsg = `${userInfo.error.error} ${userInfo.error.message}`;
    } else errorMsg = '';

    let showUserData = false;
    let isLoading = false;
    let activities: { type: string; subreddit: string; text: string; date: string; link: string }[] = [];
    $: if (showUserData && userInfo.data?.length) {
        activities = userInfo.data.slice(0, 5).map(({ kind, data }) => {
            const link = 'https://reddit.com/' + data.permalink;
            const date = new Date(data.created * 1000).toLocaleDateString();
            if (kind === 't3')
                return {
                    type: 'Post',
                    subreddit: `r/${data.subreddit}`,
                    text: (data as RedditPostData).title,
                    date,
                    link,
                };
            if (kind === 't1')
                return {
                    type: 'Comment',
                    subreddit: `r/${data.subreddit}`,
                    text: (data as RedditCommentData).body,
                    date,
                    link,
                };
        });
    }

    async function fetchUser() {
        isLoading = true;
        isBlocked.block();
        const { user } = await updateFollowingUser(userInfo);
        userInfo = user;
        isLoading = false;
        showUserData = true;
        commitChanges();
    }
</script>

<div class="flex border border-skin-base bg-skin-input rounded">
    <input
        size="13"
        maxlength="20"
        class="border-none rounded m-0"
        type="text"
        value={username}
        on:input={(e) => {
            username = e.currentTarget.value;
            inputSaved = false;
        }}
        on:change={saveUsername}
    />
    <button class="py-0 px-2 border-0 border-l rounded min-w-[4rem] text-xs" on:click={saveWatchTarget}>
        {saveBtnMessage}
    </button>
</div>

<label class="flex space-x-1 items-center" title="watch for user's comments">
    <input
        class="peer hidden"
        type="checkbox"
        checked={comments}
        on:change={(e) => {
            comments = e.currentTarget.checked;
            saveWatchTarget();
        }}
    />
    <div class="ios-checkbox" />
    <span>Comments</span>
</label>
<label class="flex space-x-1 items-center" title="watch for user's submissions">
    <input
        class="peer hidden"
        type="checkbox"
        checked={posts}
        on:change={(e) => {
            posts = e.currentTarget.checked;
            saveWatchTarget();
        }}
    />
    <div class="ios-checkbox" />
    <span>Posts</span>
</label>
<label
    class="flex items-center justify-center text-sm ml-1"
    tabindex="0"
    title="Show notification on new user activities"
>
    <input class="hidden peer" type="checkbox" bind:checked={userInfo.notify} on:change={commitChanges} />
    <div
        class={`flex items-center justify-center select-none
            text-gray-50 rounded-2xl py-[2px] px-2 hover:brightness-110 transition-colors ${
                userInfo.notify ? 'bg-skin-input-checked' : 'bg-gray-500'
            }`}
    >
        {#if userInfo.notify}
            <div class="w-5 h-5">{@html icons.NotifyIcon}</div>
        {:else}
            <div class="w-5 h-5">{@html icons.NotifyOffIcon}</div>
        {/if}
        <span class="ml-[2px]">Notify</span>
    </div>
</label>

<div class="ml-auto">
    <button
        class="flex item-center ml-auto py-0 px-1 bg-transparent border-transparent text-skin-accent"
        aria-label={getMsg('optionSubredditsDelete')}
        on:click={onDelete}
    >
        <div class="w-5 h-5">{@html icons.DeleteIcon}</div>
    </button>
</div>

<div class="col-span-full mt-1 mb-3">
    {#if userInfo.username?.length}
        <button
            class="text-skin-accent2 py-0 px-1 border-transparent bg-transparent hover:bg-transparent text-xs m-0  "
            on:click={() => void fetchUser()}
            disabled={$isBlocked}
        >
            click here to fetch and display the latest user's activities
        </button>
        <div class="ml-2">
            {#if isLoading}
                <div class="flex space-x-1 mt-2">
                    <div class="w-4 h-4 animate-spin" title="loading">{@html icons.LoadingIcon}</div>
                    <span>Loading</span>
                </div>
            {/if}
            {#if showUserData && !errorMsg}
                <div class="flex justify-between">
                    <div class="mt-2">{`${userInfo.username}' latest activities on reddit: `}</div>
                    <button
                        class="p-0 mr-2 border-none bg-transparent h-4 w-4"
                        on:click={() => {
                            showUserData = false;
                        }}
                        title="close"
                    >
                        {@html icons.XCircleIcon}
                    </button>
                </div>
                <div class="user-items-grid">
                    {#each activities as item}
                        <span>{item.date}</span>
                        <div>
                            <span>{item.type}</span>
                            <span>in</span>
                            <b>{item.subreddit}</b>
                            <span>: </span>
                        </div>
                        <a
                            class="overflow-hidden whitespace-nowrap overflow-ellipsis break-all  hover:underline"
                            href={item.link}
                            target="_blank">{item.text}</a
                        >
                    {:else}
                        <div>Empty. The user didn't submit anything.</div>
                    {/each}
                </div>
            {/if}
            {#if errorMsg}
                <span class="text-skin-error">{errorMsg}</span>
            {/if}
        </div>
    {/if}
</div>

<style lang="postcss">
    .user-items-grid {
        @apply grid gap-x-4 gap-y-0 mt-2;

        grid-template-columns: auto auto 1fr;
    }
</style>
