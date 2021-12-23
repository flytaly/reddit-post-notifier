/* eslint-disable @typescript-eslint/unbound-method */
import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { cloneDeep } from 'lodash';
import { mocked } from 'jest-mock';
import storage from '@/storage/storage';
import type { SubredditData, SubredditOpts } from '@/storage/storage-types';
import getMsg from '@/utils/get-message';
import SubredditsBlock from '../components/subreddits/SubredditsBlock.svelte';
import { tick } from 'svelte';
import { dataFields } from '@/storage/fields';

let idx = 0;
jest.mock('@/storage/storage.ts');
jest.mock('@/utils/get-message.ts');
jest.mock('@/utils/index.ts', () => ({
    // @ts-ignore
    ...jest.requireActual('@/utils/index.ts'),
    debounce: jest.fn((f: () => unknown) => f),
    generateId: jest.fn(() => `fakeId_${idx++}`),
}));

const getSubMock = mocked(storage.getSubredditList);

const like = expect.objectContaining;

describe('Subreddit settings', () => {
    const subList: SubredditOpts[] = [
        { id: 'awwId', subreddit: 'aww', disabled: true, notify: true },
        { id: 'errorId', subreddit: 'suberror', disabled: false, notify: true },
    ];
    const subData: Record<string, SubredditData> = {
        awwId: {},
        errorId: { error: { error: 404, message: 'Not Found', reason: 'banned' } },
    };

    beforeEach(() => {
        mockBrowser.storage.onChanged.addListener.spy(() => ({}));
    });

    beforeAll(() => {
        mocked(storage).getAllData.mockResolvedValue({
            ...dataFields,
            subredditList: cloneDeep(subList),
            subreddits: cloneDeep(subData),
        });
        getSubMock.mockImplementation(async () => cloneDeep(subList));
    });

    test('save subreddits and show error', async () => {
        const { getByText, getAllByLabelText, getAllByTestId } = render(SubredditsBlock);
        await tick();
        const inputs = getAllByLabelText(getMsg('optionSubredditsInput')) as HTMLInputElement[];
        const notifyElems = getAllByTestId('notify') as HTMLLabelElement[];
        const isActiveElems = getAllByTestId('isActive') as HTMLLabelElement[];

        const len = subList.length + 1;
        expect(inputs).toHaveLength(len);
        expect(notifyElems).toHaveLength(len);
        expect(isActiveElems).toHaveLength(len);

        subList.forEach((s, idx) => {
            expect(inputs[idx].value).toEqual(s.subreddit);
            expect((notifyElems[idx]).querySelector('input').checked).toEqual(s.notify);
            expect(isActiveElems[idx].querySelector('input').checked).toEqual(!s.disabled);
        });

        await waitFor(() => {
            expect(getByText(/404 Not Found \(banned\)/)).toBeInTheDocument();
        });

        const latest = inputs[subList.length];
        expect(latest.value).toBe('');
        const newSubreddit: SubredditOpts = {
            id: 'fakeId_0',
            subreddit: 'europe+pics',
            disabled: false,
        };
        await fireEvent.input(latest, { target: { value: newSubreddit.subreddit } });

        expect(storage.saveSubredditOpts).toHaveBeenCalledWith(expect.objectContaining(newSubreddit));
    });

    test('should call storage with other input states', async () => {
        const { getAllByLabelText } = render(SubredditsBlock);
        await tick();

        // NOTIFY
        const notifyElems = getAllByLabelText(getMsg('optionSubredditsNotify'));
        await fireEvent.click(notifyElems[0]);
        expect(storage.saveSubredditOpts).toHaveBeenCalledWith(
            like({
                ...subList[0],
                notify: !subList[0].notify,
            }),
        );

        // DISABLE
        const isActiveElem = getAllByLabelText(getMsg('optionSubredditsDisable'));

        mocked(storage.saveSubredditOpts).mockClear();
        await fireEvent.click(isActiveElem[1]);
        expect(storage.saveSubredditOpts).toHaveBeenCalledWith(
            like({
                ...subList[1],
                disabled: !subList[1].disabled,
            }),
        );
    });

    test('should add and remove subreddits', async () => {
        const { getAllByLabelText, getByText } = render(SubredditsBlock);
        await tick();

        const len = getAllByLabelText(getMsg('optionSubredditsInput')).length;

        const AddBtn = getByText(getMsg('optionSubredditsAdd'), { exact: false });
        await fireEvent.click(AddBtn);
        await waitFor(() => {
            expect(getAllByLabelText(getMsg('optionSubredditsInput'))).toHaveLength(len + 1);
        });
        const DelBtn = getAllByLabelText(getMsg('optionSubredditsDelete'));
        await fireEvent.click(DelBtn[0]);

        expect(storage.removeSubreddits).toHaveBeenCalledWith([subList[0].id]);
    });

    test('should save only subreddit or multireddit', async () => {
        const { getAllByLabelText, getByText } = render(SubredditsBlock);

        await tick();

        const inputs = getAllByLabelText(getMsg('optionSubredditsInput')) as HTMLInputElement[];

        const input = inputs[subList.length];

        for (const subreddit of ['!not', '12', 'aww+3']) {
            await fireEvent.input(input, { target: { value: subreddit } });
            await waitFor(() => {
                expect(getByText(/Invalid subreddit name/)).toBeInTheDocument();
            });
            expect(storage.saveSubredditOpts).not.toHaveBeenCalledWith(expect.objectContaining({ subreddit }));
        }
    });
});
