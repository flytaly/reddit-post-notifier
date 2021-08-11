<script lang="ts">
    import { flip } from 'svelte/animate';
    import { quadOut } from 'svelte/easing';
    import { fly } from 'svelte/transition';
    import type { QueryData, QueryOpts } from '../../../storage/storage-types';
    import { generateId } from '../../../utils';
    import getMsg from '../../../utils/get-message';
    import SearchFieldset from './SearchFieldset.svelte';

    export let queriesList: QueryOpts[];
    export let queriesData: Record<string, QueryData>;

    const addNewQuery = () => {
        queriesList = [...queriesList, { id: generateId() }];
    };
    addNewQuery();

    const onDelete = (id: string) => {
        queriesList = queriesList.filter((q) => q.id !== id);
    };
</script>

{#each queriesList as queryObject (queryObject.id)}
    <div
        class="mb-4"
        transition:fly|local={{ x: 400, duration: 200, easing: quadOut }}
        animate:flip={{ delay: 200, duration: 300, easing: quadOut }}
    >
        <SearchFieldset {queryObject} error={queriesData[queryObject.id]?.error} {onDelete} />
    </div>
{/each}
<button on:click={addNewQuery}> {getMsg('optionsSearchAddNew')} </button>
