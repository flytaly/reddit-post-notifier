<script lang="ts">
    import getMsg from '@/utils/get-message';
    import { storageData } from '@/views/options/store';
    import { quadOut } from 'svelte/easing';
    import { fade } from 'svelte/transition';
    import SearchFieldset from './SearchFieldset.svelte';
    import { searchStore } from './search-store';
    import AddButton from '../common/AddButton.svelte';
</script>

<div>
    <div class="my-4 text-sm">{@html getMsg('optionSearchDescription')}</div>
    {#each $searchStore as queryObject (queryObject.id)}
        <div class="mb-4" transition:fade|local={{ duration: 200, easing: quadOut }}>
            <SearchFieldset bind:queryObject queryData={$storageData.queries[queryObject.id] || {}} />
        </div>
    {/each}
</div>
<AddButton clickHandler={() => searchStore.addQuery()}>{getMsg('optionsSearchAddNew')}</AddButton>
