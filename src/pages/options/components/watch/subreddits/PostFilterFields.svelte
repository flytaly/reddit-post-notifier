<script lang="ts">
    /* eslint-disable @typescript-eslint/no-unsafe-argument */
    import type { SearchableField, FilterRule } from '@/text-search/post-filter';
    import { XCircleIcon, DeleteIcon } from '@/pages/options/icons';
    import { allFields } from '@/text-search/post-filter';
    import { debounce } from '@/utils';
    import { inputStatusStore } from './subreddits-store';

    export let filterRule: FilterRule;
    export let commitChanges: () => void;
    export let removeFilter: () => void;
    export let subId: string;
    export let index: number;

    const debounced = debounce(commitChanges, 700);
    const debouncedHandler = () => {
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
        link_flair_text: 'flair',
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

<fieldset class="rounded border border-skin-delimiter p-3 text-sm  shadow-md">
    <legend class="font-mono text-xs">Filter rule {index + 1 || ''}</legend>
    <div class="field-grid">
        {#each filterRule as searchRule, idx}
            <select
                class="rounded border-none bg-transparent hover:bg-skin-input hover:shadow-none focus:bg-skin-input"
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
                class="border-none bg-transparent py-0 px-1 text-skin-gray hover:bg-transparent hover:text-skin-accent hover:shadow-none"
                on:click={() => removeField(searchRule.field)}
            >
                <div class="w-4">{@html XCircleIcon}</div>
            </button>
            <div class="pl-3">
                {#if idx < filterRule.length - 1}
                    <div class="rounded py-px px-1 text-center font-mono text-skin-gray ring-1 ring-skin-delimiter">
                        AND
                    </div>
                {/if}
            </div>
        {/each}
    </div>
    <div class="mt-3 flex justify-between">
        <button
            on:click={addField}
            class="standard-button rounded border-transparent bg-transparent py-0 px-1 hover:border-skin-accent2"
        >
            + add field
        </button>
        <button
            on:click={removeFilter}
            class="standard-button flex items-center rounded border-transparent bg-transparent p-0 px-1 hover:border-skin-accent hover:text-skin-accent"
            title="Delete filter"
        >
            <div class="mr-1 h-4 w-4">{@html DeleteIcon}</div>
            <div>remove filter</div>
        </button>
    </div>
</fieldset>

<style lang="postcss">
    .field-grid {
        @apply grid content-center items-center gap-y-3 gap-x-2;

        grid-template-columns: max-content max-content 1fr auto auto;
    }
</style>
