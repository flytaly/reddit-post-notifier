<script lang="ts">
    import * as icons from '@/views/options/icons';
    import getMsg from '@/utils/get-message';
    import type { FollowingUser } from '@/storage/storage-types';

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
        commitChanges();
    };

    const saveUsername = () => {
        inputSaved = true;
        username = username.replace(/\s/g, '');
        userInfo.username = username;
        commitChanges();
    };

    let saveBtnMessage = '';

    $: if (!username) saveBtnMessage = ' ';
    else saveBtnMessage = username === userInfo.username || inputSaved ? 'saved' : 'save';
</script>

<div class="flex border border-skin-base bg-skin-input rounded">
    <input
        size="14"
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
<label class="flex items-center justify-center text-sm ml-1" tabindex="0">
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
