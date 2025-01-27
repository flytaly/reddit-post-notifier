<script lang='ts'>
    import NotifierApp from '@/notifier/app';
    import type { FollowingUser } from '@/storage/storage-types';
    import getMsg from '@/utils/get-message';
    import IosCheckbox from '@options/components/common/IosCheckbox.svelte';
    import NotifyToggle from '@options/components/common/NotifyToggle.svelte';
    import Spinner from '@options/components/common/Spinner.svelte';
    import RedditItemsList from '@options/components/RedditItemsList.svelte';
    import * as icons from '@options/lib/icons';
    import { RefreshIcon2 } from '@options/lib/icons';
    import { isBlocked } from '@options/lib/store';
    import { type InputChangeEv } from '../common/events';

    interface Props {
        userInfo: FollowingUser;
        commitChanges: () => void;
        onDelete: () => void;
    }

    let { userInfo = $bindable(), commitChanges, onDelete }: Props = $props();

    let username: string = $state(userInfo.username);
    let notify = $state(!!userInfo.notify);

    $effect(() => {
        userInfo.notify = notify;
    });

    let inputSaved = $state(true);
    let comments = $state(true);
    let posts = $state(true);
    let showUserData = $state(false);
    let errorMsg = $state('');
    let isLoading = $state(false);
    let saveBtnMessage = $derived.by(() => {
        if (!username) return ' ';
        return username === userInfo.username || inputSaved ? 'saved' : 'save';
    });

    $effect(() => {
        if (userInfo.username !== username && inputSaved)
            username = userInfo.username;
    });

    $effect(() => {
        switch (userInfo.watch) {
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
    });

    const saveWatchTarget = () => {
        if (posts)
            userInfo.watch = 'submitted';
        if (comments)
            userInfo.watch = 'comments';
        if (comments && posts)
            userInfo.watch = 'overview';
        else if (!comments && !posts)
            userInfo.watch = userInfo.watch === 'comments' ? 'submitted' : 'comments';
        userInfo = { ...userInfo, lastUpdate: null, lastPostCreated: null, data: [] };
        commitChanges();
    };

    const saveUsername = () => {
        inputSaved = true;
        showUserData = false;
        username = username.replace(/\s/g, '');
        userInfo = { ...userInfo, username, error: null, lastUpdate: null, lastPostCreated: null, data: [] };
        commitChanges();
    };

    $effect(() => {
        if (userInfo.error)
            errorMsg = `${userInfo.error.error || ''} ${userInfo.error.message || ''}`;
        else errorMsg = '';
    });

    async function fetchUser() {
        isLoading = true;
        isBlocked.block();
        const app = new NotifierApp();
        app.reddit.fetchOpts = { cache: 'default' };
        try {
            const { user } = await app.updateFollowingUser({ ...userInfo, data: [], lastPostCreated: 0 });
            userInfo = user;
            showUserData = true;
            commitChanges();
        }
        catch (e: unknown) {
            errorMsg = (e as { message?: string }).message || '';
        }
        isLoading = false;
    }

    const commentChange = (e: InputChangeEv) => {
        comments = e.currentTarget.checked;
        saveWatchTarget();
    };

    const postChange = (e: InputChangeEv) => {
        posts = e.currentTarget.checked;
        saveWatchTarget();
    };
</script>

<div class='flex rounded border border-skin-border bg-skin-input hover:shadow-input'>
    <input
        size='13'
        maxlength='20'
        class='m-0 rounded-l rounded-r-none border-none hover:shadow-none'
        type='text'
        value={username}
        oninput={(e) => {
            username = e.currentTarget.value;
            inputSaved = false;
        }}
        onchange={saveUsername}
    />
    <button
        class='min-w-[4rem] rounded-l-none rounded-r border-0 border-l px-2 py-0 text-xs'
        onclick={saveWatchTarget}
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
    bind:checked={notify}
    changeHandler={() => commitChanges()}
    title='Show notification on new user activities'
/>

<div class='ml-auto'>
    <button
        class='icon-button ml-auto text-skin-accent'
        aria-label={getMsg('optionWatchInputDelete')}
        onclick={onDelete}
    >
        <div class='h-5 w-5'>{@html icons.DeleteIcon}</div>
    </button>
</div>

<div class='col-span-full mb-3 mt-1'>
    {#if userInfo.username?.length}
        <button
            class='flex items-center border-transparent bg-transparent p-0 text-xs text-skin-accent2 hover:bg-transparent'
            onclick={() => void fetchUser()}
            disabled={$isBlocked}
        >
            <div class='mr-1 h-5 w-5'>
                {@html RefreshIcon2}
            </div>
            <span>{getMsg('optionsFollowUserFetch')}</span>
        </button>
        <div class='mb-2 ml-2'>
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
                <span class='text-skin-error'>{errorMsg}</span>
            {/if}
        </div>
    {/if}
</div>
