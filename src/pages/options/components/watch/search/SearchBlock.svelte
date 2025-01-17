<script lang='ts'>
    import { storageData } from '@options/lib/store';
    import { quadOut } from 'svelte/easing';
    import { fade } from 'svelte/transition';

    import getMsg from '@/utils/get-message';
    import AddButton from '@options/components/common/AddButton.svelte';
    import BlockDescription from '@options/components/common/BlockDescription.svelte';
    import { RefreshIcon2 } from '@options/lib/icons';
    import { searchStore } from './search-store';
    import SearchFieldset from './SearchFieldset.svelte';
</script>

<div>
    <BlockDescription>{@html getMsg('optionSearchDescription')}</BlockDescription>
    <div class='watch-item-grid' class:hidden={$searchStore.length === 0}>
        <div class='px-2 font-medium'>{getMsg('optionWatchInputNameColumn')}</div>
        <div class='invisible flex font-normal'>
            <div class='mr-1 h-5 w-5'>{@html RefreshIcon2}</div>
            <span>{getMsg('optionsSubredditFetch')}</span>
        </div>
        <div class='w-12 text-center font-medium'>{getMsg('optionWatchInputActiveColumn')}</div>
        <div class='w-48'></div>
        <div class='w-14'></div>
        <div class='w-8'></div>
    </div>
    {#each $searchStore as queryObject (queryObject.id)}
        <div class='mb-2' transition:fade|local={{ duration: 200, easing: quadOut }}>
            <SearchFieldset { queryObject } queryData={$storageData.queries[queryObject.id] || {}} />
        </div>
    {/each}
</div>
<AddButton clickHandler={() => searchStore.addQuery()}>{getMsg('optionsSearchAddNew')}</AddButton>
