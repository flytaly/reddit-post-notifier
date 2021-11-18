<script lang="ts">
    import storage from '@/storage';
    import type { StorageFields } from '@/storage/storage-types';
    import type { ExtensionOptions } from '@/types/extension-options';
    import { AddIcon } from '@/views/options/icons';
    import { storageData } from '../../popup/store/store';
    import FollowUserInput from './FollowUserInput.svelte';

    let options: ExtensionOptions = $storageData.options;
    let usersList: StorageFields['usersList'] = $storageData.usersList;

    $: options = $storageData.options;
    $: usersList = $storageData.usersList;

    const addUser = () => {
        $storageData.usersList = [...usersList, { username: '', data: [], watch: 'overview' }];
    };

    if (!usersList.length) addUser();

    const saveInputs = () => {
        const saved = new Set<string>();
        void storage.saveUsersList(
            usersList.filter((u) => {
                if (!u.username || saved.has(u.username)) return false;
                saved.add(u.username);
                return true;
            }),
        );
    };

    const removeUser = (index: number) => {
        $storageData.usersList = usersList.filter((_, idx) => index !== idx);
        saveInputs();
    };
</script>

<div>
    <div class="user-input-grid">
        <div>Username</div>
        <div class="text-center">
            <span>Commentes</span>
        </div>
        <div class="text-center">
            <span>Posts</span>
        </div>
        <div class="text-center">Notification</div>
        <div class="ml-auto">Delete</div>
        <div class="col-span-full my-2" />
        {#each usersList as userInfo, index}
            <FollowUserInput bind:userInfo commitChanges={saveInputs} onDelete={() => removeUser(index)} />
        {/each}
    </div>
    <button
        class="flex items-center rounded p-1 bg-transparent  border-transparent hover:border-skin-accent2 text-skin-accent2"
        on:click={addUser}
    >
        <span class="w-5 h-5 mr-1">
            {@html AddIcon}
        </span>
        <div>Add user to follow</div>
    </button>
</div>

<style lang="postcss">
    .user-input-grid {
        @apply grid grid-cols-5 gap-x-5 items-center;

        grid-template-columns: repeat(4, max-content) 1fr;
    }
</style>
