<script lang="ts">
    import NotifierApp from '@/notifier/app';
    import type { FollowingUser } from '@/storage/storage-types';
    import getMsg from '@/utils/get-message';
    import * as icons from '@/pages/options/icons';
    import { RefreshIcon2 } from '@/pages/options/icons';
    import { isBlocked } from '../store';
    import IosCheckbox from './common/IosCheckbox.svelte';
    import NotifyToggle from './common/NotifyToggle.svelte';
    import Spinner from './common/Spinner.svelte';
    import RedditItemsList from './RedditItemsList.svelte';

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
        errorMsg = `${userInfo.error.error || ''} ${userInfo.error.message || ''}`;
    } else errorMsg = '';

    let showUserData = false;
    let isLoading = false;

    async function fetchUser() {
        isLoading = true;
        isBlocked.block();
        const app = new NotifierApp();
        try {
            const { user } = await app.updateFollowingUser({ ...userInfo, data: [], lastPostCreated: 0 });
            userInfo = user;
            showUserData = true;
            commitChanges();
        } catch (e: unknown) {
            errorMsg = (e as { message?: string }).message || '';
        }
        isLoading = false;
    }

    const commentChange = (e: Event & { currentTarget: HTMLInputElement }) => {
        comments = (e.currentTarget as HTMLInputElement).checked;
        saveWatchTarget();
    };

    const postChange = (e: Event & { currentTarget: HTMLInputElement }) => {
        posts = e.currentTarget.checked;
        saveWatchTarget();
    };
</script>

<div class="flex rounded border border-skin-base bg-skin-input">
    <input
        size="13"
        maxlength="20"
        class="m-0 rounded-l rounded-r-none border-none"
        type="text"
        value={username}
        on:input={(e) => {
            username = e.currentTarget.value;
            inputSaved = false;
        }}
        on:change={saveUsername}
    />
    <button
        class="min-w-[4rem] rounded-l-none rounded-r border-0 border-l py-0 px-2 text-xs"
        on:click={saveWatchTarget}
    >
        {saveBtnMessage}
    </button>
</div>

<IosCheckbox checked={comments} changeHandler={commentChange} title="watch for user's comments">
    <span>Comments</span>
</IosCheckbox>

<IosCheckbox checked={posts} changeHandler={postChange} title="watch for user's submissions">
    <span>Posts</span>
</IosCheckbox>

<NotifyToggle
    bind:checked={userInfo.notify}
    changeHander={commitChanges}
    title="Show notification on new user activities"
/>

<div class="ml-auto">
    <button
        class="icon-button ml-auto text-skin-accent"
        aria-label={getMsg('optionSubredditsDelete')}
        on:click={onDelete}
    >
        <div class="h-5 w-5">{@html icons.DeleteIcon}</div>
    </button>
</div>

<div class="col-span-full mt-1 mb-3">
    {#if userInfo.username?.length}
        <button
            class="flex items-center border-transparent bg-transparent p-0 text-xs text-skin-accent2 hover:bg-transparent"
            on:click={() => void fetchUser()}
            disabled={$isBlocked}
        >
            <div class="mr-1 h-5 w-5">
                {@html RefreshIcon2}
            </div>
            <span>{getMsg('optionsFollowUserFetch')}</span>
        </button>
        <div class="ml-2 mb-2">
            <Spinner show={isLoading} />
            {#if showUserData && !errorMsg}
                <RedditItemsList
                    title={`${userInfo.username}' latest activities on reddit: `}
                    items={userInfo.data}
                    onClose={() => {
                        showUserData = false;
                    }}
                />
            {/if}
            {#if errorMsg}
                <span class="text-skin-error">{errorMsg}</span>
            {/if}
        </div>
    {/if}
</div>
