import { act, cleanup, fireEvent, getByLabelText, render, waitFor } from '@testing-library/svelte';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import userEvent from '@testing-library/user-event';
import SearchBlock from './SearchBlock.svelte';
import storage from '@/storage';
import { dataFields } from '@/storage/fields';
import type { QueryData, QueryOpts } from '@/storage/storage-types';
import getMsg from '@/utils/get-message';
import { wait } from '@/utils/wait';

vi.mock('@/storage/storage.ts');
vi.mock('@/utils/get-message.ts');
vi.mock('@/utils/index.ts', async (importOriginal) => {
    const mod = (await importOriginal()) as any;
    return {
        ...mod,
        debounce: vi.fn((f: () => unknown) => f),
    };
});

describe('search settings block', () => {
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

    it('render and save', async () => {
        vi.mocked(storage.getQueriesList).mockResolvedValue(structuredClone(queriesList));
        const { getAllByTestId, getByText, getByTestId } = render(SearchBlock);

        await waitFor(() => {
            expect(getByTestId('search-inputs')).toBeInTheDocument();
        });
        const user = userEvent.setup();

        const items = getAllByTestId('search-inputs');
        expect(items).toHaveLength(1);

        await user.click(getByText('q1Name'));

        const getInput = (label: string) => getByLabelText(items[0], label, { exact: false });

        expect(getInput('Name:')).toHaveValue(queriesList[0].name);
        expect(getInput('Subreddit:')).toHaveValue(queriesList[0].subreddit);
        expect(getInput('Search query:')).toHaveValue(queriesList[0].query);
        expect(getInput(getMsg('optionSearchNotify'))).toBeChecked();
        const inp = getInput('Subreddit:');
        await user.clear(inp);
        await user.type(inp, 'Sub2');
        expect(storage.saveQuery).toHaveBeenCalledWith({ ...queriesList[0], subreddit: 'Sub2' });
    });

    it('should add fieldset', async () => {
        vi.mocked(storage.getQueriesList).mockImplementationOnce(async () => []);
        const { getByText, queryAllByTestId } = render(SearchBlock);

        expect(queryAllByTestId('search-inputs')).toHaveLength(1);

        await act(async () => {
            await fireEvent.click(getByText('Add new search'));
        });
        await act(async () => {
            await fireEvent.click(getByText('Add new search'));
        });
        waitFor(() => {
            expect(queryAllByTestId('search-inputs')).toHaveLength(3);
        });
    });
});
