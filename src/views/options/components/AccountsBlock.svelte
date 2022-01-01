<script lang="ts">
    import auth from '@/reddit-api/auth';
    import type { AuthUser, StorageFields } from '@/storage/storage-types';
    import getMsg from '@/utils/get-message';
    import { isBlocked, storageData } from '../store';
    import Account from './Account.svelte';
    import AddButton from './common/AddButton.svelte';
    import BlockDescription from './common/BlockDescription.svelte';

    let accounts: StorageFields['accounts'] = $storageData.accounts;
    let accList: AuthUser[] = [];

    $: {
        accounts = $storageData.accounts;
        accList = Object.values(accounts);
    }

    let authError = '';
    let isAuthorizing = false;
    let disabled = false;

    $: disabled = isAuthorizing || $isBlocked;

    const authorize = async (id?: string, onSuccess?: () => unknown) => {
        isAuthorizing = true;
        try {
            await auth.login(id);
            onSuccess?.();
        } catch (e) {
            console.error(e);
            authError = e.message;
        }
        isAuthorizing = false;
    };
</script>

<div class="text-sm">
    <BlockDescription>
        <span>
            {getMsg('optionAccountsDescription')}
        </span>
        <a href="#info">{getMsg('optionReadMore')}</a>
    </BlockDescription>
    <div class="my-4">
        {#if accList?.length}
            <ul>
                {#each accList as acc (acc.id)}
                    <Account {accounts} {acc} {authorize} {isAuthorizing} />
                {/each}
            </ul>
        {:else}
            <div class="font-medium">{getMsg('optionAccountsNoAccs')}</div>
        {/if}
    </div>
    <AddButton clickHandler={() => authorize()} {disabled}>{getMsg('optionAccountsAddBtn')}</AddButton>
    {#if authError}
        <div class="mt-2 text-skin-error"><span>Error: </span><span>{authError}</span></div>
    {/if}
</div>
