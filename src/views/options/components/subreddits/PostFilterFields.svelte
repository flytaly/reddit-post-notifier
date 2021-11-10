<script lang="ts">
    import type { SearchableField, FilterRule } from '@/text-search/post-filter';
    import { XCircleIcon, DeleteIcon } from '@/views/options/icons';
    import { allFields } from '@/text-search/post-filter';
    import { debounce } from '@/utils';
    import { inputStatusStore } from './subreddits-store';

    export let filterRule: FilterRule;
    export let commitChanges: () => void;
    export let removeFilter: () => void;
    export let subId: string;
    export let index: number;

    let debounced = debounce(commitChanges, 700);
    let debouncedHandler = () => {
        $inputStatusStore[subId] = { typing: true };
        debounced(filterRule);
    };

    let usedFields: SearchableField[] = [];
    let unUsedFields: SearchableField[] = [];

    $: usedFields = filterRule.map((r) => r.field);
    $: unUsedFields = allFields.filter((f) => !usedFields.includes(f));

    const fieldNames: Record<SearchableField, string> = {
        author: 'author',
        selftext: 'selftext',
        link_flair_text: 'flar',
        title: 'title',
    };

    const matchType = (field: SearchableField) => {
        if (field === 'author') return 'is';
        return 'has the words';
    };

    const addField = () => {
        if (unUsedFields.length) {
            filterRule = [...filterRule, { field: unUsedFields[0], query: '' }];
            commitChanges();
        }
    };

    const removeField = (field: SearchableField) => {
        if (filterRule.length > 1) {
            filterRule = filterRule.filter((g) => g.field !== field);
        } else {
            filterRule = filterRule.map((g) => (g.field === field ? { ...g, query: '' } : g));
        }
        commitChanges();
    };
</script>

<fieldset class="border border-skin-gray2 rounded text-sm p-3  shadow-md">
    <legend class="text-xs font-mono">Filter rule {index + 1 || ''}</legend>
    <div class="field-grid">
        {#each filterRule as searchRule, idx}
            <select
                class="border-none bg-transparent hover:bg-skin-input hover:shadow-none focus:bg-skin-input rounded"
                name={`field_${idx}`}
                bind:value={searchRule.field}
                on:change={commitChanges}
            >
                {#each [searchRule.field, ...unUsedFields] as f}
                    <option value={f}>{fieldNames[f]}</option>
                {/each}
            </select>
            <div class="mx-2">{matchType(searchRule.field)}</div>
            <input class="w-full rounded" type="text" bind:value={searchRule.query} on:input={debouncedHandler} />
            <button
                class="py-0 px-1 text-skin-gray border-none bg-transparent hover:bg-transparent hover:shadow-none hover:text-skin-accent"
                on:click={() => removeField(searchRule.field)}
            >
                <div class="w-4">{@html XCircleIcon}</div>
            </button>
            <div class="pl-3">
                {#if idx < filterRule.length - 1}
                    <div class="py-px px-1 ring-1 ring-skin-gray2 text-center font-mono text-skin-gray rounded">
                        AND
                    </div>
                {/if}
            </div>
        {/each}
    </div>
    <div class="flex justify-between mt-3">
        <button
            on:click={addField}
            class="py-0 px-1 bg-transparent border-transparent hover:border-skin-accent2 rounded">+ add field</button
        >
        <button
            on:click={removeFilter}
            class="flex items-center p-0 bg-transparent border-transparent hover:text-skin-accent hover:border-skin-accent rounded"
            title="Delete filter"
        >
            <div class="h-4 w-4 mr-1">{@html DeleteIcon}</div>
            <div>remove filter</div>
        </button>
    </div>
</fieldset>

<style lang="postcss">
    .field-grid {
        @apply grid gap-y-3 gap-x-2 items-center content-center;

        grid-template-columns: max-content max-content 1fr auto auto;
    }
</style>
