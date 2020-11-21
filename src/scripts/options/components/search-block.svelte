<script>
    import { flip } from 'svelte/animate';
    import { quadOut } from 'svelte/easing';
    import { fly } from 'svelte/transition';
    import { generateId, getMsg } from '../../utils';
    import SearchFieldset from './search-fieldset.svelte';

    export let queriesList;
    export let queriesData;

    const addNewQuery = () => {
        queriesList = [...queriesList, { id: generateId() }];
    };
    addNewQuery();
    $: console.log('queriesList:', queriesList);

    const onDelete = (id) => {
        queriesList = queriesList.filter((q) => q.id !== id);
    };
</script>

<style>
    .item {
        margin-bottom: 1rem;
    }
</style>

{#each queriesList as queryObject (queryObject.id)}
    <div
        class="item"
        transition:fly={{ x: 400, duration: 200, easing: quadOut }}
        animate:flip={{ delay: 200, duration: 300, easing: quadOut }}>
        <SearchFieldset {queryObject} error={queriesData[queryObject.id]?.error} {onDelete} />
    </div>
{/each}
<button on:click={addNewQuery}> {getMsg('optionsSearchAddNew')} </button>
