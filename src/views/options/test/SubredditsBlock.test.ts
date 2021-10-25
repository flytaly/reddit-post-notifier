/* eslint-disable @typescript-eslint/unbound-method */
import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { cloneDeep } from 'lodash';
import storage from '../../../storage/storage';
import type { SubredditData, SubredditOpts } from '../../../storage/storage-types';
import getMsg from '../../../utils/get-message';
import SubredditsBlock from '../components/SubredditsBlock.svelte';

let idx = 0;
jest.mock('../../../storage/storage.ts');
jest.mock('../../../utils/get-message.ts');
jest.mock('../../../utils/index.ts');
jest.mock('../../../utils/index.ts', () => ({
    // @ts-ignore
    ...jest.requireActual('../../../utils/index.ts'),
    debounce: jest.fn((f: () => unknown) => f),
    generateId: jest.fn(() => `fakeId_${idx++}`),
}));

describe('Subreddit settings', () => {
    const subList: SubredditOpts[] = [
        { id: 'awwId', subreddit: 'aww', disabled: true, notify: true },
        { id: 'errorId', subreddit: 'suberror', disabled: false, notify: true },
    ];
    const subData: Record<string, SubredditData> = {
        awwId: {},
        errorId: { error: { error: 404, message: 'Not Found', reason: 'banned' } },
    };

    test('save subreddits and show error', async () => {
        const { getByText, getAllByLabelText, getAllByTestId } = render(SubredditsBlock, {
            subredditList: cloneDeep(subList),
            subredditsData: cloneDeep(subData),
        });

        const inputs = getAllByLabelText(getMsg('optionSubredditsInput')) as HTMLInputElement[];
        const notifyElems = getAllByTestId('notify') as HTMLInputElement[];
        const isActiveElems = getAllByTestId('isActive') as HTMLInputElement[];

        const len = subList.length + 1;
        expect(inputs).toHaveLength(len);
        expect(notifyElems).toHaveLength(len);
        expect(isActiveElems).toHaveLength(len);

        subList.forEach((s, idx) => {
            expect(inputs[idx].value).toEqual(s.subreddit);
            expect(notifyElems[idx].checked).toEqual(s.notify);
            expect(isActiveElems[idx].checked).toEqual(!s.disabled);
        });

        const latest = inputs[subList.length];
        expect(latest.value).toBe('');
        const newSubreddit: SubredditOpts = {
            id: 'fakeId_0',
            subreddit: 'europe+pics',
            disabled: false,
        };
        await fireEvent.input(latest, { target: { value: newSubreddit.subreddit } });

        expect(storage.saveSubredditOpts).toHaveBeenCalledWith(newSubreddit);

        expect(getByText(/404 Not Found \(banned\)/)).toBeInTheDocument();
    });

    test('should call storage with other input states', async () => {
        const { getAllByLabelText } = render(SubredditsBlock, {
            subredditList: cloneDeep(subList),
            subredditsData: {},
        });

        // NOTIFY
        const notifyElems = getAllByLabelText(getMsg('optionSubredditsNotify'));
        await fireEvent.click(notifyElems[0]);
        expect(storage.saveSubredditOpts).toHaveBeenCalledWith({
            ...subList[0],
            notify: !subList[0].notify,
        });

        // DISABLE
        const isActiveElem = getAllByLabelText(getMsg('optionSubredditsDisable'));
        await fireEvent.click(isActiveElem[1]);
        expect(storage.saveSubredditOpts).toHaveBeenCalledWith({
            ...subList[1],
            notify: !subList[1].disabled,
        });
    });

    test('should add and remove subreddits', async () => {
        const { getAllByLabelText, getByText } = render(SubredditsBlock, {
            subredditList: cloneDeep(subList),
            subredditsData: {},
        });

        const AddBtn = getByText(getMsg('optionSubredditsAdd'), { exact: false });
        await fireEvent.click(AddBtn);

        expect(getAllByLabelText(getMsg('optionSubredditsInput'))).toHaveLength(subList.length + 2);

        const DelBtn = getAllByLabelText(getMsg('optionSubredditsDelete'));
        await fireEvent.click(DelBtn[0]);
        expect(storage.removeSubreddits).toHaveBeenCalledWith([subList[0].id]);
        await waitFor(
            () => expect(getAllByLabelText(getMsg('optionSubredditsInput'))).toHaveLength(subList.length + 1),
            { timeout: 300 },
        );
    });

    test('should save only subreddit or multireddit', async () => {
        const { getAllByLabelText, getByText } = render(SubredditsBlock, {
            subredditList: cloneDeep(subList),
            subredditsData: {},
        });

        const inputs = getAllByLabelText(getMsg('optionSubredditsInput')) as HTMLInputElement[];

        const input = inputs[subList.length];

        for (const subreddit of ['!not', '12', 'aww+3']) {
            await fireEvent.input(input, { target: { value: subreddit } });

            expect(getByText('Invalid subreddit name')).toBeInTheDocument();
            expect(storage.saveSubredditOpts).not.toHaveBeenCalledWith(expect.objectContaining({ subreddit }));
        }
    });
});
