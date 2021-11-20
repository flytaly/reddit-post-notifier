<script lang="ts">
    import storage from '@/storage';
    import type { FollowingUser, StorageFields } from '@/storage/storage-types';
    import type { ExtensionOptions } from '@/types/extension-options';
    import { AddIcon } from '@/views/options/icons';
    import { WarningIcon } from '@/views/options/icons';
    import DEFAULT_OPTIONS from '../../../options-default';
    import auth from '../../../reddit-api/auth';
    import redditScopes from '../../../reddit-api/scopes';
    import { storageData } from '../../popup/store/store';
    import FollowUserInput from './FollowUserInput.svelte';
    import OptionsItem from './OptionsItem.svelte';
    import RadioGroup from './RadioGroup.svelte';

    let options: ExtensionOptions = $storageData.options;
    let usersList: StorageFields['usersList'] = $storageData.usersList;
    let needReAuth = false;
    let isAuthorizing = false;
    let authError = '';

    $: options = $storageData.options;
    $: usersList = $storageData.usersList;

    $: if ($storageData.refreshToken) {
        const scope = $storageData.scope;
        needReAuth = !scope || !scope.includes(redditScopes.history.id);
    } else {
        needReAuth = false;
    }

    const authorize = async () => {
        isAuthorizing = true;
        try {
            await auth.login();
            await storage.saveOptions({ messages: true, messagesNotify: true });
        } catch (e) {
            console.error(e);
            authError = e.message;
        }
        isAuthorizing = false;
    };

    /** save number of inputs to restore them after rerender cased by saving in the storage */
    let prevLen = usersList.length;

    const addUsers = (num = 1) => {
        const newUsers = Array.from({ length: num }).map(() => ({
            username: '',
            data: [],
            watch: 'overview',
        })) as FollowingUser[];

        usersList = [...usersList, ...newUsers];
        $storageData.usersList = usersList;
        prevLen = $storageData.usersList.length;
    };

    $: if (!usersList.length || usersList.length < prevLen) addUsers(Math.max(prevLen - usersList.length || 1));

    const saveInputs = () => {
        const saved = new Set<string>();

        const unique = usersList.filter((u) => {
            if (!u.username || saved.has(u.username)) return false;
            saved.add(u.username);
            return true;
        });

        void storage.saveUsersList(unique);
    };

    const removeUser = (index: number) => {
        usersList = usersList.filter((_, idx) => index !== idx);
        prevLen = usersList.length;
        saveInputs();
    };

    const themeValueList: Array<{ value: string; id: string; label: string }> = [
        { value: String(60), id: '1m', label: '1m' },
        { value: String(5 * 60), id: '5m', label: '5m' },
        { value: String(10 * 60), id: '10m', label: '10m' },
        { value: String(15 * 60), id: '15m', label: '15m' },
        { value: String(30 * 60), id: '30m', label: '30m' },
        { value: String(60 * 60), id: '1h', label: '1h' },
    ];
    const changeIntervalHandler = (value: string) => {
        void storage.saveOptions({
            pollUserInterval: parseInt(value) || DEFAULT_OPTIONS.updateInterval,
        });
    };
</script>

<div>
    <OptionsItem title="Minimum update interval">
        <div slot="description">
            Considering that most users don't post and comment very often, it's reasonable to poll it slower than
            subreddits. The value will be ignored if it's lower than the global update interval.
        </div>
        <div slot="controls">
            <div class="flex flex-col">
                <RadioGroup
                    onChange={changeIntervalHandler}
                    valueList={themeValueList}
                    currentValue={String($storageData.options.pollUserInterval)}
                />
                <div class="mt-4">
                    Global update interval is {Math.round((options.updateInterval / 60) * 10) / 10} min
                </div>
            </div>
        </div>
    </OptionsItem>

    {#if needReAuth}
        <div class="mb-6 p-2 flex items-center shadow-sidebar">
            <div class="w-2/3 mr-1">
                <div class="flex items-center text-skin-accent text-base">
                    <div class="w-5 h-5 mr-1">{@html WarningIcon}</div>
                    <span>
                        {"You don't have enough permissions to fetch users "}
                    </span>
                </div>
                <div>
                    {`Probably the extension was authorized in the earlier version (< 4.0.0).`}
                    <br />
                    {`"history" permission is required by reddit to fetch users. Reauthorize to hide this message.`}
                </div>
            </div>
            <div class="ml-auto text-right">
                <button on:click={authorize} disabled={isAuthorizing}>{'reauthorize'}</button>
                <div class="text-skin-error mt-1">
                    {authError}&nbsp;
                </div>
            </div>
        </div>
    {/if}

    <div class="user-input-grid">
        <div>Username</div>
        <div class="text-center">
            <span>Comments</span>
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
        on:click={() => addUsers()}
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
