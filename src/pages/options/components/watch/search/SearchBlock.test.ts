/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/unbound-method */
import { act, cleanup, fireEvent, getByLabelText, render, waitFor } from '@testing-library/svelte';
import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest';

import storage from '@/storage';
import { dataFields } from '@/storage/fields';
import type { QueryData, QueryOpts } from '@/storage/storage-types';
import getMsg from '@/utils/get-message';
import SearchBlock from './SearchBlock.svelte';

vi.mock('@/storage/storage.ts');
vi.mock('@/utils/get-message.ts');
vi.mock('@/utils/index.ts', async (importOriginal) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod = (await importOriginal()) as any;
    return {
        ...mod,
        debounce: vi.fn((f: () => unknown) => f),
    };
});

describe('Search settings block', () => {
    const queriesList: QueryOpts[] = [
        { id: 'id1', name: 'q1Name', notify: true, query: 'q1Query', subreddit: 'q1Subreddit', disabled: false },
    ];
    const queriesData: Record<string, QueryData> = {
        id1: { error: null },
    };

    beforeAll(() => {
        vi.mocked(storage.getAllData).mockImplementation(async () => {
            return { ...dataFields, queries: queriesData, queriesList };
        });
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    test('render and save', async () => {
        vi.mocked(storage.getQueriesList).mockResolvedValue(structuredClone(queriesList));
        const { getAllByTestId, getByText, getByTestId } = render(SearchBlock);

        await waitFor(() => {
            expect(getByTestId('search-inputs')).toBeInTheDocument();
        });

        const items = getAllByTestId('search-inputs');
        expect(items).toHaveLength(1);

        await fireEvent.click(getByText('q1Name'));

        const getInput = (label: string) => getByLabelText(items[0], label, { exact: false });

        expect(getInput('Name:')).toHaveValue(queriesList[0].name);
        expect(getInput('Subreddit:')).toHaveValue(queriesList[0].subreddit);
        expect(getInput('Search query:')).toHaveValue(queriesList[0].query);
        expect(getInput(getMsg('optionSearchNotify'))).toBeChecked();
        await fireEvent.input(getInput('Subreddit:'), { target: { value: 'Sub2' } });
        expect(storage.saveQuery).toHaveBeenCalledWith({ ...queriesList[0], subreddit: 'Sub2' });
    });

    test.only('should add fieldset', async () => {
        vi.mocked(storage.getQueriesList).mockImplementationOnce(async () => []);
        const { getByText, queryAllByTestId } = render(SearchBlock);

        expect(queryAllByTestId('search-inputs')).toHaveLength(0);

        await act(async () => {
            await fireEvent.click(getByText('Add new search'));
        });
        await act(async () => {
            await fireEvent.click(getByText('Add new search'));
        });
        expect(queryAllByTestId('search-inputs')).toHaveLength(2);
    });
});
