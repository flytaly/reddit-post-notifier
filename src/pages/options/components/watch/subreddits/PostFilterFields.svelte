<script lang='ts'>
    import { DeleteIcon, XCircleIcon } from '@options/lib/icons';
    import { inputStatusStore } from './subreddits-store';
    import type { FilterRule, SearchableField } from '@/text-search/post-filter';
    import { allFields } from '@/text-search/post-filter';
    import { debounce } from '@/utils';

    interface Props {
        filterRule: FilterRule;
        commitChanges: () => void;
        removeFilter: () => void;
        subId: string;
        index: number;
    }

    let {
        filterRule = $bindable(),
        commitChanges,
        removeFilter,
        subId,
        index,
    }: Props = $props();

    const debounced = debounce(commitChanges, 700);
    const debouncedHandler = () => {
        $inputStatusStore[subId] = { typing: true };
        debounced();
    };

    const fieldNames: Record<SearchableField, string> = {
        author: 'author',
        selftext: 'selftext',
        link_flair_text: 'flair',
        title: 'title',
    };

    const matchTypes = (field: SearchableField): {
        queryType: 'negative' | 'positive';
        text: string;
    }[] => {
        if (field === 'author') {
            return [
                { queryType: 'positive', text: 'is' },
                { queryType: 'negative', text: 'is not' },
            ];
        }
        return [
            { queryType: 'positive', text: 'has the words' },
            { queryType: 'negative', text: 'doesn\'t have' },
        ];
    };

    const addField = () => {
        filterRule = [...filterRule, { field: allFields[0], query: '', queryType: 'positive' }];
        commitChanges();
    };

    const removeField = (index: number) => {
        if (filterRule.length > 1)
            filterRule = filterRule.filter((_, i) => i !== index);
        else
            filterRule = [{ field: allFields[0], query: '', queryType: 'positive' }];

        commitChanges();
    };
</script>

<fieldset class='rounded border border-skin-delimiter p-3 text-sm shadow-md'>
    <legend class='font-mono text-xs'>Filter rule {index + 1 || ''}</legend>
    <div class='field-grid'>
        {#each filterRule as searchRule, idx}
            <select
                class='rounded border-none bg-transparent hover:bg-skin-input hover:shadow-none focus:bg-skin-input'
                name={`field_${idx}`}
                bind:value={searchRule.field}
                onchange={commitChanges}
            >
                {#each allFields as f}
                    <option value={f}>{fieldNames[f]}</option>
                {/each}
            </select>
            <select
                class='mx-2 rounded border-none bg-transparent hover:bg-skin-input hover:shadow-none focus:bg-skin-input'
                name={`matchType_${idx}`}
                bind:value={searchRule.queryType}
                onchange={commitChanges}
            >
                {#each matchTypes(searchRule.field) as mt}
                    <option value={mt.queryType}>{mt.text}</option>
                {/each}
            </select>
            <input class='w-full rounded' type='text' bind:value={searchRule.query} oninput={debouncedHandler} />
            <button
                class='border-none bg-transparent px-1 py-0 text-skin-gray hover:bg-transparent hover:text-skin-accent hover:shadow-none'
                onclick={() => removeField(idx)}
            >
                <div class='w-4'>{@html XCircleIcon}</div>
            </button>
            <div class='pl-3'>
                {#if idx < filterRule.length - 1}
                    <div class='rounded px-1 py-px text-center font-mono text-skin-gray ring-1 ring-skin-delimiter'>
                        AND
                    </div>
                {/if}
            </div>
        {/each}
    </div>
    <div class='mt-3 flex justify-between'>
        <button
            onclick={addField}
            class='standard-button rounded border-transparent bg-transparent px-1 py-0 hover:border-skin-accent2'
        >
            + add field
        </button>
        <button
            onclick={removeFilter}
            class='standard-button flex items-center rounded border-transparent bg-transparent p-0 px-1 hover:border-skin-accent hover:text-skin-accent'
            title='Delete filter'
        >
            <div class='mr-1 h-4 w-4'>{@html DeleteIcon}</div>
            <div>remove filter</div>
        </button>
    </div>
</fieldset>

<style lang='postcss'>
    .field-grid {
        @apply grid content-center items-center gap-x-2 gap-y-3;

        grid-template-columns: max-content max-content 1fr auto auto;
    }
</style>
