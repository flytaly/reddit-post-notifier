<script lang="ts">
    import NotifierApp from '@/notifier/app';
    import storage from '@/storage';
    import type { AuthUser, StorageFields } from '@/storage/storage-types';
    import getMsg from '@/utils/get-message';
    import { onMount } from 'svelte';
    import { AccountIcon, DeleteIcon, RefreshIcon2 } from '../icons';
    import { isBlocked } from '../store';
    import IosCheckbox from './common/IosCheckbox.svelte';
    import NotifyToggle from './common/NotifyToggle.svelte';
    import Spinner from './common/Spinner.svelte';
    import MessagesList from './MessagesList.svelte';

    export let accounts: StorageFields['accounts'];
    export let acc: AuthUser;
    export let authorize: (id?: string, fn?: () => Promise<void>) => Promise<void>;
    export let isAuthorizing = false;

    let isUpdating = false;
    let isUpdatingMessages = false;
    let errorList: string[] = [];
    let disabled = false;
    let showMessages = false;

    $: disabled = isUpdating || isUpdatingMessages || isAuthorizing || $isBlocked;

    const updateAcc = async () => {
        isUpdating = true;
        isBlocked.block();
        const app = new NotifierApp();
        await app.updateAccounts(accounts || {}, acc.id);
        isUpdating = false;
    };

    const deleteHandler = () => void storage.removeAccount([acc.id]);

    const getErrors = (u: AuthUser) => {
        const res: string[] = [];
        if (u.error) res.push(u.error);
        if (u.auth.error) {
            res.push(u.auth.error);
        }
        if (!u.auth.refreshToken) {
            res.push('Refresh token is missing or invalid. Please reathorize the account');
        }
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

    const checkMailCommit = async (e: Event) => {
        const checked = (e.currentTarget as HTMLInputElement).checked;
        acc.checkMail = checked;
        if (!checked) acc.mailNotify = false;
        await storage.saveAccounts(accounts);
    };

    const notifyMailCommit = async (e: Event) => {
        const checked = (e.currentTarget as HTMLInputElement).checked;
        acc.mailNotify = checked;
        if (checked) acc.checkMail = true;
        await storage.saveAccounts(accounts);
    };

    const reAuth = () => authorize(acc.id, updateAcc);
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
            {#if acc.img}
                <img class="h-8 w-8" src={acc.img} alt="avatar" />
            {:else}
                <div class="w-7 text-skin-gray">
                    {@html AccountIcon}
                </div>
            {/if}
            <span>
                {acc.name || `~ no account info`}
            </span>
        {/if}
    </div>
    <div class="mx-4">
        <IosCheckbox
            checked={acc.checkMail}
            changeHandler={checkMailCommit}
            title={getMsg('optionAccountsMailCheck_title')}
        >
            <span class="text-xs">{getMsg('optionAccountsMailCheck')}</span>
        </IosCheckbox>
    </div>
    <div class="mx-4">
        <NotifyToggle
            checked={acc.mailNotify}
            changeHander={notifyMailCommit}
            title={getMsg('optionAccountsMailNotify_title')}
        />
    </div>
    <button class="icon-button text-skin-accent ml-auto" on:click={deleteHandler} {disabled} title="Delete the account">
        <div class="h-5 w-5">
            {@html DeleteIcon}
        </div>
    </button>
    <div class="text-xs col-span-full">
        <div class="flex justify-between">
            <button
                class="flex items-center text-skin-accent2 p-0 border-transparent bg-transparent hover:bg-transparent text-xs ml-8"
                on:click={() => void updateMessages()}
                {disabled}
            >
                <div class="w-5 h-5 mr-1">
                    {@html RefreshIcon2}
                </div>
                <span>{getMsg('optionAccountsFetchBtn')}</span>
            </button>
            <div class="ml-auto" />
            <button class="bg-transparent rounded-sm py-[1px] px-1" on:click={reAuth} {disabled}>
                {getMsg('optionAccountsReAuthBtn')}</button
            >
        </div>
        <Spinner show={isUpdatingMessages} />
        {#if errorList?.length}
            <div class="p-1 pl-8 text-skin-error">
                {#each errorList as errMsg}
                    <div>{errMsg}</div>
                {/each}
            </div>
        {/if}

        {#if showMessages}
            <div class="max-w-full border p-1 border-skin-delimiter mt-2">
                <MessagesList
                    title={`${acc.name || ''} unread private messages`}
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
        @apply grid gap-x-2 gap-y-1 mb-6 w-full max-w-full items-center;

        grid-template-columns: min-content minmax(auto, 1fr) auto auto auto;
    }
</style>
