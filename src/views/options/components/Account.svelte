<script lang="ts">
    import NotifierApp from '@/notifier/app';
    import storage from '@/storage';
    import type { AuthUser, StorageFields } from '@/storage/storage-types';
    import { onMount } from 'svelte';
    import { DeleteIcon, RefreshIcon2 } from '../icons';
    import { isBlocked } from '../store';
    import IosCheckbox from './common/IosCheckbox.svelte';
    import NotifyToggle from './common/NotifyToggle.svelte';
    import Spinner from './common/Spinner.svelte';
    import MessagesList from './MessagesList.svelte';

    export let accounts: StorageFields['accounts'];
    export let acc: AuthUser;

    let isUpdating = false;
    let isUpdatingMessages = false;
    let errorList: string[] = [];
    let disabled = false;
    let showMessages = false;

    $: disabled = isUpdating || isUpdatingMessages || $isBlocked;

    const updateAcc = async () => {
        isUpdating = true;
        isBlocked.block();
        const app = new NotifierApp();
        await app.updateAccounts(accounts, acc.id);
        isUpdating = false;
    };

    const deleteHandler = () => void storage.removeAccount([acc.id]);

    const getErrors = (u: AuthUser) => {
        const res: string[] = [];
        if (u.auth.error) res.push(u.auth.error);
        if (u.error) res.push(u.error);
        return res;
    };

    $: errorList = getErrors(acc);

    const updateMessages = async () => {
        isUpdatingMessages = true;
        isBlocked.block();
        const app = new NotifierApp();
        await app.updateUnreadMsg(acc);
        isUpdatingMessages = false;
        showMessages = true;
    };

    onMount(() => {
        if (!acc.name) void updateAcc();
    });
</script>

<li>
    <button
        class="flex items-center text-skin-accent2 p-0 border-transparent bg-transparent hover:bg-transparent text-xs"
        on:click={updateAcc}
        {disabled}
        title="update account information"
    >
        <div class="w-5 h-5 mr-1">
            {@html RefreshIcon2}
        </div>
    </button>
    <div class="flex items-center gap-1 ">
        <Spinner show={isUpdating} label="" />
        {#if !isUpdating}
            <img class="h-8 w-8" src={acc.img} alt="avatar" />
            <span>
                {acc.name || `~ no account info`}
            </span>
        {/if}
    </div>
    <div class="mx-4">
        <IosCheckbox checked={acc.checkMail}>
            <span class="text-xs">Watch for Messages</span>
        </IosCheckbox>
    </div>
    <div class="mx-4">
        <NotifyToggle checked={acc.mailNotify} title="Notify on the new private messages" />
    </div>
    <button class="icon-button text-skin-accent ml-auto" on:click={deleteHandler} {disabled} title="Delete the account">
        <div class="h-5 w-5">
            {@html DeleteIcon}
        </div>
    </button>
    <div class="text-xs col-span-full">
        <button
            class="flex items-center text-skin-accent2 p-0 border-transparent bg-transparent hover:bg-transparent text-xs ml-8"
            on:click={() => void updateMessages()}
            {disabled}
        >
            <div class="w-5 h-5 mr-1">
                {@html RefreshIcon2}
            </div>
            <span>fetch and display unread messages</span>
        </button>
        <Spinner show={isUpdatingMessages} />
        <div class="text-skin-error">
            {#each errorList as errMsg}
                <div>{errMsg}</div>
            {/each}
        </div>

        {#if showMessages}
            <div class="max-w-full border p-1 border-skin-delimiter ">
                <MessagesList
                    title={`${acc.name} unread private messages`}
                    items={acc.mail?.messages || []}
                    limit={10}
                    onClose={() => {
                        showMessages = false;
                    }}
                />
            </div>
        {/if}
    </div>
</li>

<style lang="postcss">
    li {
        @apply grid gap-2 mb-6 w-full max-w-full;

        grid-template-columns: min-content minmax(auto, 1fr) auto auto auto;
    }
</style>
