<script lang='ts'>
    import DEFAULT_OPTIONS from '@/options-default';
    import storage from '@/storage';
    import type { FollowingUser } from '@/storage/storage-types';
    import getMsg from '@/utils/get-message';
    import AddButton from '@options/components/common/AddButton.svelte';
    import BlockDescription from '@options/components/common/BlockDescription.svelte';
    import OptionsItem from '@options/components/OptionsItem.svelte';
    import RadioGroup from '@options/components/RadioGroup.svelte';
    import { storageData } from '@options/lib/store';
    import FollowUserInput from './FollowUserInput.svelte';

    let usersList: FollowingUser[] = $state($storageData.usersList || []);

    let globalUpdateInterval = $derived.by(() => {
        return $storageData.options.updateInterval;
    });

    /** save number of inputs to restore them after rerender caused by saving in the storage */
    let prevLen = $state($storageData.usersList?.length || 0);

    const addUsers = (num = 1) => {
        const newUsers = Array.from({ length: num }).map(() => ({
            username: '',
            data: [],
            watch: 'overview',
        })) as FollowingUser[];

        usersList = usersList?.length ? [...usersList, ...newUsers] : newUsers;

        $storageData.usersList = usersList;
        prevLen = $storageData.usersList.length;
    };

    $effect(() => {
        if (!usersList.length || usersList.length < prevLen)
            addUsers(Math.max(prevLen - usersList.length, 1));
    });

    const saveInputs = () => {
        const saved = new Set<string>();

        const unique = usersList.filter((u) => {
            if (!u.username || saved.has(u.username))
                return false;
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

    const intervalList: Array<{ value: string; id: string; label: string }> = [
        { value: String(60), id: '1m', label: '1m' },
        { value: String(5 * 60), id: '5m', label: '5m' },
        { value: String(10 * 60), id: '10m', label: '10m' },
        { value: String(15 * 60), id: '15m', label: '15m' },
        { value: String(30 * 60), id: '30m', label: '30m' },
        { value: String(60 * 60), id: '1h', label: '1h' },
    ];
    const changeIntervalHandler = (value: string) => {
        void storage.saveOptions({
            pollUserInterval: Number.parseInt(value) || DEFAULT_OPTIONS.updateInterval,
        });
    };
</script>

<div>
    <BlockDescription>{getMsg('optionsFollowUserDescription')}</BlockDescription>
    <OptionsItem title='Minimum update interval'>
        {#snippet description()}
            <div >
                {getMsg('optionsFollowUserMinUpdate')}
            </div>
        {/snippet}
        {#snippet controls()}
            <div >
                <div class='flex flex-col'>
                    <RadioGroup
                        onChange={changeIntervalHandler}
                        valueList={intervalList}
                        currentValue={String($storageData.options.pollUserInterval)}
                    />
                    <div class='mt-4'>
                        {getMsg('optionsFollowUserGlobal', String(Math.round((globalUpdateInterval / 60) * 10) / 10))}
                    </div>
                </div>
            </div>
        {/snippet}
    </OptionsItem>

    <div class='user-input-grid text-sm font-medium'>
        <div>Username</div>
        <div class='text-center'>
            <span>Comments</span>
        </div>
        <div class='text-center'>
            <span>Posts</span>
        </div>
        <div class='text-center'>Notification</div>
        <div class='ml-auto'>Delete</div>
        <div class='col-span-full my-2'></div>
        <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
        {#each usersList || [] as _, index}
            <FollowUserInput bind:userInfo={usersList[index]} commitChanges={saveInputs} onDelete={() => removeUser(index)} />
        {/each}
    </div>
    <AddButton clickHandler={() => addUsers()}>{getMsg('optionsFollowUserAdd')}</AddButton>
</div>

<style lang='postcss'>
    .user-input-grid {
        @apply grid grid-cols-5 items-center gap-x-5;

        grid-template-columns: repeat(4, max-content) 1fr;
    }
</style>
