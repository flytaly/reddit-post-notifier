<script lang="ts">
    import auth from '@/reddit-api/auth';
    import type { AuthUser, StorageFields } from '@/storage/storage-types';
    import getMsg from '@/utils/get-message';
    import { isBlocked, storageData } from '@options/lib/store';
    import AddButton from '@options/components/common/AddButton.svelte';
    import BlockDescription from '@options/components/common/BlockDescription.svelte';
    import { HelpCircleIcon } from '@options/lib/icons';
    import { tooltip } from '@options/lib/tooltip';
    import Account from './Account.svelte';

    let accounts: StorageFields['accounts'] = $storageData.accounts;
    let accList: AuthUser[] = [];

    $: {
        accounts = $storageData.accounts;
        accList = Object.values(accounts || {});
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
        <span class="flex items-center">
            <span>{getMsg('optionAccountsDescription')}</span>
            <span
                class="ml-2 inline-flex h-4 w-4 text-skin-accent2"
                use:tooltip={{ content: getMsg('helpAccount'), allowHTML: true }}
            >
                {@html HelpCircleIcon}
            </span>
        </span>
    </BlockDescription>
    <div class="my-2">
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
