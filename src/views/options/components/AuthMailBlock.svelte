<script lang="ts">
    import type { AuthUser, StorageFields } from '@/storage/storage-types';
    import { RefreshIcon2 } from '@/views/options/icons';
    import { storageData } from '../store';
    import AddButton from './common/AddButton.svelte';
    import auth from '@/reddit-api/auth';
    import NotifierApp from '@/notifier/app';

    let accounts: StorageFields['accounts'] = $storageData.accounts;
    let accList: AuthUser[] = [];

    $: {
        accounts = $storageData.accounts;
        accList = Object.values(accounts);
    }

    let authError = '';
    let isAuthorizing = false;
    let updatingId: string | null = '';

    const authorize = async () => {
        isAuthorizing = true;
        try {
            await auth.login();
        } catch (e) {
            console.error(e);
            authError = e.message;
        }
        isAuthorizing = false;
    };

    const updateAcc = async (id: string) => {
        updatingId = id;
        const app = new NotifierApp();
        await app.updateAccounts(accounts, id);
        updatingId = null;
    };
</script>

<div>
    <div>Description</div>
    <ul>
        {#each accList as acc, num (acc.id)}
            <li>
                <div class="flex gap-3">
                    <button
                        class="flex items-center text-skin-accent2 p-0 border-transparent bg-transparent hover:bg-transparent text-xs"
                        on:click={() => void updateAcc(String(acc.id))}
                        disabled={isAuthorizing || !!updatingId}
                        title="update"
                    >
                        <div class="w-5 h-5 mr-1">
                            {@html RefreshIcon2}
                        </div>
                    </button>
                    <div>{acc.name || `User${num}`}</div>
                </div>
                {#if acc.auth.error || acc.error}
                    <div>
                        <div>Errors:</div>
                        <div>{acc.error || acc.auth.error || ''}</div>
                    </div>
                {/if}
            </li>
        {:else}
            <div>No authorized accounts</div>
        {/each}
    </ul>
    <div>{authError}</div>
    <AddButton clickHandler={() => authorize()} disabled={isAuthorizing || !!updatingId}>Add account</AddButton>
</div>
