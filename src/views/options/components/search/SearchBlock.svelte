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
    <div class="my-4 text-sm">
        You can stay up to date with reddit search by adding a query in the "search query" field. Look at the
        <a href="https://www.reddit.com/wiki/search#wiki_field_search" target="_blank">reddit search wiki</a> to learn
        supported keywords and
        <a href="https://www.reddit.com/wiki/search#wiki_boolean_operators" target="_blank"> boolean operators</a>.
    </div>
    {#each $searchStore as queryObject (queryObject.id)}
        <div class="mb-4" transition:fade|local={{ duration: 200, easing: quadOut }}>
            <SearchFieldset bind:queryObject queryData={$storageData.queries[queryObject.id] || {}} />
        </div>
    {/each}
</div>
<AddButton clickHandler={() => searchStore.addQuery()}>{getMsg('optionsSearchAddNew')}</AddButton>
