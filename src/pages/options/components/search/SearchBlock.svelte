<script lang="ts">
    import getMsg from '@/utils/get-message';
    import { storageData } from '@/pages/options/store';
    import { quadOut } from 'svelte/easing';
    import { fade } from 'svelte/transition';
    import SearchFieldset from './SearchFieldset.svelte';
    import { searchStore } from './search-store';
    import AddButton from '../common/AddButton.svelte';
    import BlockDescription from '../common/BlockDescription.svelte';
</script>

<div>
    <BlockDescription>{@html getMsg('optionSearchDescription')}</BlockDescription>
    {#each $searchStore as queryObject (queryObject.id)}
        <div class="mb-4" transition:fade|local={{ duration: 200, easing: quadOut }}>
            <SearchFieldset bind:queryObject queryData={$storageData.queries[queryObject.id] || {}} />
        </div>
    {/each}
</div>
<AddButton clickHandler={() => searchStore.addQuery()}>{getMsg('optionsSearchAddNew')}</AddButton>
