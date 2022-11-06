<script lang="ts">
    import storage from '@/storage';
    import type { FollowingUser } from '@/storage/storage-types';
    import type { ExtensionOptions } from '@/types/extension-options';
    import getMsg from '@/utils/get-message';
    import DEFAULT_OPTIONS from '@/options-default';
    import { storageData } from '@options/lib/store';
    import AddButton from '@options/components/common/AddButton.svelte';
    import BlockDescription from '@options/components/common/BlockDescription.svelte';
    import FollowUserInput from './FollowUserInput.svelte';
    import OptionsItem from '@options/components/OptionsItem.svelte';
    import RadioGroup from '@options/components/RadioGroup.svelte';

    let options: ExtensionOptions = $storageData.options;
    let usersList: FollowingUser[] = $storageData.usersList || [];

    $: options = $storageData.options;
    $: usersList = $storageData.usersList || [];

    /** save number of inputs to restore them after rerender caused by saving in the storage */
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

    $: if (!usersList.length || usersList.length < prevLen) addUsers(Math.max(prevLen - usersList.length, 1));

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
    <BlockDescription>{getMsg('optionsFollowUserDescription')}</BlockDescription>
    <OptionsItem title="Minimum update interval">
        <div slot="description">
            {getMsg('optionsFollowUserMinUpdate')}
        </div>
        <div slot="controls">
            <div class="flex flex-col">
                <RadioGroup
                    onChange={changeIntervalHandler}
                    valueList={themeValueList}
                    currentValue={String($storageData.options.pollUserInterval)}
                />
                <div class="mt-4">
                    {getMsg('optionsFollowUserGlobal', String(Math.round((options.updateInterval / 60) * 10) / 10))}
                </div>
            </div>
        </div>
    </OptionsItem>

    <div class="user-input-grid text-sm font-medium">
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
        {#each usersList || [] as userInfo, index}
            <FollowUserInput bind:userInfo commitChanges={saveInputs} onDelete={() => removeUser(index)} />
        {/each}
    </div>
    <AddButton clickHandler={() => addUsers()}>{getMsg('optionsFollowUserAdd')}</AddButton>
</div>

<style lang="postcss">
    .user-input-grid {
        @apply grid grid-cols-5 items-center gap-x-5;

        grid-template-columns: repeat(4, max-content) 1fr;
    }
</style>
