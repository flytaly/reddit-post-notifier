/* eslint-disable @typescript-eslint/unbound-method */
import { fireEvent, render } from '@testing-library/svelte';
import { mocked } from 'ts-jest/utils';
import storage from '../../../storage/storage';
import type { SubredditData } from '../../../storage/storage-types';
import type { ExtensionOptions } from '../../../types/extension-options';
import { debounce } from '../../../utils';
import getMsg from '../../../utils/get-message';
import SubredditsBlock from '../components/SubredditsBlock.svelte';

jest.mock('../../../storage/storage.ts');
jest.mock('../../../utils/get-message.ts');
jest.mock('../../../utils/index.ts');

function optionSaved(opt: Partial<ExtensionOptions>) {
    expect(storage.saveOptions).toHaveBeenCalledWith(opt);
}

describe('Subreddit settings', () => {
    beforeAll(() => {
        mocked(debounce).mockImplementation(jest.fn((f: () => unknown) => f));
    });

    test('save subreddits and show error', async () => {
        const subredditList = ['aww', 'suberror'];
        const modifiedList = [...subredditList, 'sub3'];

        const subredditsData: Record<string, SubredditData> = {
            aww: {},
            suberror: { error: { error: 404, message: 'Not Found', reason: 'banned' } },
        };
        const { getByLabelText, getByText } = render(SubredditsBlock, {
            subredditNotify: true,
            subredditList,
            subredditsData,
        });

        const input = getByLabelText(getMsg('optionSubreddits'), { exact: false });

        expect(input).toHaveValue(subredditList.join(' '));
        await fireEvent.input(input, { target: { value: modifiedList.join(' ') } });
        expect(storage.saveSubredditList).toHaveBeenCalledWith(modifiedList);

        expect(getByText('404 Not Found (banned)')).toBeInTheDocument();

        const notify = getByLabelText('show desktop notifications', { exact: false });

        expect(notify).toBeChecked();
        await fireEvent.click(notify);
        optionSaved({ subredditNotify: false });
    });
});
