/* eslint-disable @typescript-eslint/unbound-method */
import { test } from '@jest/globals';
import { fireEvent, getByLabelText, render, waitFor } from '@testing-library/svelte';
import { mocked } from 'ts-jest/utils';
import storage from '../../../storage';
import type { QueryData, QueryOpts } from '../../../storage/storage-types';
import { debounce } from '../../../utils';
import SearchBlock from '../components/SearchBlock.svelte';

jest.mock('../../../storage/storage.ts');
jest.mock('../../../utils/get-message.ts');
jest.mock('../../../utils/index.ts');

describe('Search settings block', () => {
    const queriesList: QueryOpts[] = [
        { id: 'id1', name: 'q1Name', notify: true, query: 'q1Query', subreddit: 'q1Subreddit' },
    ];
    const queriesData: Record<string, QueryData> = {
        id1: { error: null },
    };
    beforeAll(() => {
        mocked(debounce).mockImplementation(jest.fn((f: () => unknown) => f));
    });

    test('render and save', async () => {
        //
        const { getAllByTestId } = render(SearchBlock, {
            queriesList,
            queriesData,
        });
        const forms = getAllByTestId('search-fieldset');
        expect(forms).toHaveLength(2);

        const getInput = (label: string) => getByLabelText(forms[0], label, { exact: false });

        expect(getInput('Name:')).toHaveValue(queriesList[0].name);
        expect(getInput('Subreddit:')).toHaveValue(queriesList[0].subreddit);
        expect(getInput('Search query:')).toHaveValue(queriesList[0].query);
        expect(getInput('show desktop notifications')).toBeChecked();

        await fireEvent.input(getInput('Subreddit:'), { target: { value: 'Sub2' } });

        expect(storage.saveQuery).toHaveBeenCalledWith({ ...queriesList[0], subreddit: 'Sub2' });
    });

    test('should add and delete fieldsets', async () => {
        const { getAllByTestId, getAllByText, getByText } = render(SearchBlock, { queriesList, queriesData });
        const delBtns = getAllByText('Delete the search');
        expect(delBtns).toHaveLength(2);

        expect(getAllByTestId('search-fieldset')).toHaveLength(2);

        await fireEvent.click(delBtns[1]);
        await waitFor(() => {
            const formsAfterDeleting = getAllByTestId('search-fieldset');
            expect(formsAfterDeleting).toHaveLength(1);
        });

        await fireEvent.click(getByText('Add new search'));
        await waitFor(() => {
            const formsAfterDeleting = getAllByTestId('search-fieldset');
            expect(formsAfterDeleting).toHaveLength(2);
        });
    });
});
