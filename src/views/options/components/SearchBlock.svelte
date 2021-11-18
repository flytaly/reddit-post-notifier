<script lang="ts">
    import type { QueryOpts } from '@/storage/storage-types';
    import { generateId } from '@/utils';
    import getMsg from '@/utils/get-message';
    import { AddIcon } from '@/views/options/icons';
    import { quadOut } from 'svelte/easing';
    import { fade } from 'svelte/transition';
    import { storageData } from '../../popup/store/store';
    import SearchFieldset from './SearchFieldset.svelte';

    export let queriesListStore: QueryOpts[];

    let queriesList = queriesListStore || [];

    const addNewQuery = () => {
        queriesList = [...queriesList, { id: generateId() }];
    };

    if (!queriesList.length) addNewQuery();

    const onDelete = (id: string) => {
        queriesList = queriesList.filter((q) => q.id !== id);
    };
</script>

{#each queriesList as queryObject (queryObject.id)}
    <div class="mb-4" transition:fade|local={{ duration: 200, easing: quadOut }}>
        <SearchFieldset {queryObject} error={$storageData.queries[queryObject.id]?.error} {onDelete} />
    </div>
{/each}

<button
    class="flex items-center rounded p-1 bg-transparent  border-transparent hover:border-skin-accent2 text-skin-accent2"
    on:click={addNewQuery}
>
    <span class="w-5 h-5 mr-1">
        {@html AddIcon}
    </span>
    <div>{getMsg('optionsSearchAddNew')}</div>
</button>
