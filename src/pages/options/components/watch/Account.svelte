<script lang='ts'>
    import IosCheckbox from '@options/components/common/IosCheckbox.svelte';
    import NotifyToggle from '@options/components/common/NotifyToggle.svelte';
    import Spinner from '@options/components/common/Spinner.svelte';
    import { AccountIcon, DeleteIcon, LoginIcon, RefreshIcon2 } from '@options/lib/icons';
    import { isBlocked } from '@options/lib/store';
    import { tooltip } from '@options/lib/tooltip';
    import { onMount } from 'svelte';
    import MessagesList from './MessagesList.svelte';
    import getMsg from '@/utils/get-message';
    import type { AuthUser, StorageFields } from '@/storage/storage-types';
    import storage from '@/storage';
    import NotifierApp from '@/notifier/app';

    interface Props {
        accounts: StorageFields['accounts'];
        acc: AuthUser;
        authorize: (id?: string, fn?: () => Promise<void>) => Promise<void>;
        isAuthorizing?: boolean;
    }

    let {
        accounts,
        acc = $bindable(),
        authorize,
        isAuthorizing = false,
    }: Props = $props();

    let isUpdating = $state(false);
    let isUpdatingMessages = $state(false);
    let showMessages = $state(false);
    let disabled = $derived.by(() => isUpdating || isUpdatingMessages || isAuthorizing || $isBlocked);

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
        if (u.error)
            res.push(u.error);
        if (u.auth.error)
            res.push(u.auth.error);

        if (!u.auth.refreshToken)
            res.push('Refresh token is missing or invalid. Please reathorize the account');

        return res;
    };

    let errorList = $derived.by(() => getErrors(acc));

    const updateMessages = async () => {
        isUpdatingMessages = true;
        isBlocked.block();
        const app = new NotifierApp();
        await app.updateUnreadMsg(acc);
        isUpdatingMessages = false;
        showMessages = true;
    };

    onMount(() => {
        if (!acc.name)
            void updateAcc();
    });

    const checkMailCommit = async (e: Event) => {
        const checked = (e.currentTarget as HTMLInputElement).checked;
        acc.checkMail = checked;
        if (!checked)
            acc.mailNotify = false;
        await storage.saveAccounts(accounts);
    };

    const notifyMailCommit = async (e: Event) => {
        const checked = (e.currentTarget as HTMLInputElement).checked;
        acc.mailNotify = checked;
        if (checked)
            acc.checkMail = true;
        await storage.saveAccounts(accounts);
    };

    const reAuth = () => authorize(acc.id, updateAcc);
</script>

<li>
    <button
        class='flex items-center border-transparent bg-transparent p-0 text-xs text-skin-accent2 hover:bg-transparent'
        onclick={updateAcc}
        {disabled}
        use:tooltip={{ content: 'update account\'s information' }}
    >
        <div class='h-5 w-5'>
            {@html RefreshIcon2}
        </div>
    </button>

    <div class='flex items-center gap-1'>
        <Spinner show={isUpdating} label="" />
        {#if !isUpdating}
            {#if acc.img}
                <img class='h-8 w-8' src={acc.img} alt='avatar' />
            {:else}
                <div class='w-7 text-skin-gray'>
                    {@html AccountIcon}
                </div>
            {/if}
            <span class='overflow-hidden text-ellipsis'>
                {acc.name || `~ no account info`}
            </span>
        {/if}
    </div>

    <!-- Fetch Messages -->
    <div class='ml-4'>
        <button
            class='flex items-center border-transparent bg-transparent p-0 text-xs text-skin-accent2 hover:bg-transparent'
            onclick={() => void updateMessages()}
            use:tooltip={{ content: getMsg('optionAccountsFetchBtnDesc') }}
            {disabled}
        >
            <div class='mr-1 h-5 w-5'>
                {@html RefreshIcon2}
            </div>
            <span class='text-skin-text'>{getMsg('optionAccountsFetchBtn')}</span>
        </button>
    </div>

    <!-- Disable/Enable -->
    <div class='ml-4'>
        <IosCheckbox
            checked={acc.checkMail}
            changeHandler={checkMailCommit}
            tooltipText={getMsg('optionAccountsMailCheck_title')}
        >
            <span class='text-xs'>{getMsg('optionAccountsMailCheck')}</span>
        </IosCheckbox>
    </div>

    <!-- Notify -->
    <div class='ml-4 flex'>
        <NotifyToggle
            checked={acc.mailNotify}
            changeHandler={notifyMailCommit}
            tooltipText={getMsg('optionAccountsMailNotify_title')}
        />
    </div>

    <!-- Remove -->
    <div class='ml-auto'>
        <button
            class='icon-button text-skin-accent'
            onclick={deleteHandler}
            {disabled}
            use:tooltip={{ content: 'remove this account' }}
        >
            <div class='h-5 w-5'>
                {@html DeleteIcon}
            </div>
        </button>
    </div>

    <!-- Login -->
    <div>
        <button
            class='icon-button'
            use:tooltip={{ content: getMsg('optionAccountsReAuthBtn') }}
            onclick={reAuth}
            {disabled}
        >
            <span class='mr-1 h-5 w-5'>{@html LoginIcon}</span>
        </button>
    </div>

    <div class='col-span-full text-xs'>
        <div class='flex justify-between'>
            <div class='ml-auto'></div>
        </div>
        <Spinner show={isUpdatingMessages} />
        {#if errorList?.length}
            <div class='p-1 pl-8 text-skin-error'>
                {#each errorList as errMsg}
                    <div>{errMsg}</div>
                {/each}
            </div>
        {/if}

        {#if showMessages}
            <div class='mt-2 max-w-full border border-skin-delimiter p-1'>
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

<style lang='postcss'>
    li {
        @apply mb-2 grid w-full max-w-full items-center gap-x-2 gap-y-1;

        grid-template-columns: min-content minmax(10rem, 18rem) max-content max-content auto min-content min-content;
    }
</style>
