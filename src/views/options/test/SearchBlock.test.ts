/* eslint-disable @typescript-eslint/unbound-method */
import { test } from '@jest/globals';
import { fireEvent, getByLabelText, render, waitFor } from '@testing-library/svelte';
import storage from '@/storage';
import type { QueryData, QueryOpts } from '@/storage/storage-types';
import SearchBlock from '../components/SearchBlock.svelte';
import getMsg from '@/utils/get-message';
import { mocked } from 'ts-jest/utils';
import { dataFields } from '@/storage/fields';
import { tick } from 'svelte';

jest.mock('@/storage/storage.ts');
jest.mock('@/utils/get-message.ts');
jest.mock('@/utils/index.ts', () => ({
    // @ts-ignore
    ...jest.requireActual('@/utils/index.ts'),
    debounce: jest.fn((f: () => unknown) => f),
}));

describe('Search settings block', () => {
    const queriesList: QueryOpts[] = [
        { id: 'id1', name: 'q1Name', notify: true, query: 'q1Query', subreddit: 'q1Subreddit' },
    ];
    const queriesData: Record<string, QueryData> = {
        id1: { error: null },
    };

    beforeEach(() => {
        mockBrowser.storage.onChanged.addListener.spy(() => ({}));
        mockBrowser.storage.onChanged.removeListener.spy(() => ({}));
    });

    beforeAll(() => {
        mocked(storage).getAllData.mockResolvedValue({ ...dataFields, queries: queriesData, queriesList });
    });

    test('render and save', async () => {
        //
        const { getAllByTestId } = render(SearchBlock, { queriesListStore: queriesList });
        await tick();

        const forms = getAllByTestId('search-fieldset');
        expect(forms).toHaveLength(1);

        const getInput = (label: string) => getByLabelText(forms[0], label, { exact: false });

        expect(getInput('Name:')).toHaveValue(queriesList[0].name);
        expect(getInput('Subreddit:')).toHaveValue(queriesList[0].subreddit);
        expect(getInput('Search query:')).toHaveValue(queriesList[0].query);
        expect(getInput(getMsg('optionSearchNotify'))).toBeChecked();

        await fireEvent.input(getInput('Subreddit:'), { target: { value: 'Sub2' } });

        expect(storage.saveQuery).toHaveBeenCalledWith({ ...queriesList[0], subreddit: 'Sub2' });
    });

    test('should add and delete fieldsets', async () => {
        const { getAllByTestId, getAllByText, getByText, queryAllByTestId } = render(SearchBlock, {
            queriesListStore: queriesList,
        });
        const delBtns = getAllByText('Delete the search');
        expect(delBtns).toHaveLength(1);

        expect(getAllByTestId('search-fieldset')).toHaveLength(1);

        await fireEvent.click(delBtns[0]);
        await waitFor(() => {
            const formsAfterDeleting = queryAllByTestId('search-fieldset');
            expect(formsAfterDeleting).toHaveLength(0);
        });

        await fireEvent.click(getByText('Add new search'));
        await waitFor(() => {
            const formsAfterDeleting = getAllByTestId('search-fieldset');
            expect(formsAfterDeleting).toHaveLength(1);
        });
    });
});
