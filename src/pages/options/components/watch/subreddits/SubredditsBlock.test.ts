import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { tick } from 'svelte';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { dataFields } from '@/storage/fields';
import storage from '@/storage/storage';
import type { SubredditData, SubredditOpts } from '@/storage/storage-types';
import getMsg from '@/utils/get-message';
import SubredditsBlock from './SubredditsBlock.svelte';

let idx = 0;
vi.mock('@/storage/storage.ts');
vi.mock('@/utils/get-message.ts');
vi.mock('@/utils/index.ts', async (importOriginal) => {
    const mod = (await importOriginal()) as any;
    return {
        ...mod,
        generateId: vi.fn(() => `fakeId_${idx++}`),
        debounce: vi.fn((f: () => unknown) => f),
    };
});

const like = (obj: any) => expect.objectContaining(obj);

describe('subreddit settings', () => {
    const subList: SubredditOpts[] = [
        { id: 'awwId', subreddit: 'aww', disabled: true, notify: true },
        { id: 'errorId', subreddit: 'suberror', disabled: false, notify: true },
    ];
    const subData: Record<string, SubredditData> = {
        awwId: {},
        errorId: { error: { error: 404, message: 'Not Found', reason: 'banned' } },
    };

    beforeAll(() => {
        vi.mocked(storage.getAllData).mockResolvedValue({
            ...dataFields,
            subredditList: structuredClone(subList),
            subreddits: structuredClone(subData),
        });
        vi.mocked(storage.getSubredditList).mockImplementation(async () => structuredClone(subList));
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('save subreddits and show error', async () => {
        const { getByText, getAllByTestId } = render(SubredditsBlock);
        await tick();

        await waitFor(() => {
            getAllByTestId('input-name');
        });

        const names = getAllByTestId('input-name');
        const notifyElems = getAllByTestId('notify') as HTMLLabelElement[];
        const isActiveElems = getAllByTestId('isActive') as HTMLLabelElement[];

        const len = subList.length;
        expect(names).toHaveLength(len);
        expect(notifyElems).toHaveLength(len);
        expect(isActiveElems).toHaveLength(len);

        subList.forEach((s, idx) => {
            expect(names[idx]).toHaveTextContent(s.subreddit!);
            expect(notifyElems[idx].querySelector('input')?.checked).toEqual(s.notify);
            expect(isActiveElems[idx].querySelector('input')?.checked).toEqual(!s.disabled);
        });

        await waitFor(() => {
            const warnings = getAllByTestId('warning-icon');
            expect(warnings).toHaveLength(1);
            warnings[0].click();
            expect(getByText(/404 Not Found \(banned\)/)).toBeInTheDocument();
        });
    });

    it('should save subreddit or multireddit', async () => {
        const { getAllByTestId, getByText, getByTestId } = render(SubredditsBlock);
        await tick();

        await waitFor(async () => {
            const AddBtn = getByText(getMsg('optionSubredditsAdd'), { exact: false });
            await act(async () => {
                await fireEvent.click(AddBtn);
            });
        });

        const inputBlocks = getAllByTestId('input-name');
        const lastInput = inputBlocks[inputBlocks.length - 1];
        lastInput.click();

        const input = getByTestId('subredditInput');
        for (const subreddit of ['!not', 'tt']) {
            const user = userEvent.setup();
            await user.clear(input);
            await user.type(input, subreddit);
            expect(storage.saveSubredditOpts).not.toHaveBeenCalledWith(expect.objectContaining({ subreddit }));
        }
    });

    it('should call storage with other input states', async () => {
        const { getAllByLabelText } = render(SubredditsBlock);
        await tick();

        // NOTIFY
        await waitFor(async () => {
            const notifyElems = getAllByLabelText(getMsg('notifyLabel'), { exact: false });
            await fireEvent.click(notifyElems[0]);
        });

        await waitFor(() => {
            expect(storage.saveSubredditOpts).toHaveBeenCalledWith(like({ ...subList[0], notify: !subList[0].notify }));
        });

        // DISABLE
        const isActiveElem = getAllByLabelText(getMsg('optionWatchInputDisable'));

        vi.mocked(storage.saveSubredditOpts).mockClear();
        await fireEvent.click(isActiveElem[1]);
        await waitFor(() => {
            expect(storage.saveSubredditOpts).toHaveBeenCalledWith(
                like({
                    ...subList[1],
                    disabled: !subList[1].disabled,
                }),
            );
        });
    });

    it('should add and remove subreddits', async () => {
        const { getAllByLabelText, getByText, getAllByTestId } = render(SubredditsBlock);
        await tick();

        let len = 0;
        await waitFor(() => {
            len = getAllByTestId('input-name').length;
        });

        const AddBtn = getByText(getMsg('optionSubredditsAdd'), { exact: false });
        await fireEvent.click(AddBtn);
        await waitFor(() => {
            expect(getAllByTestId('input-name')).toHaveLength(len + 1);
        });
        const DelBtn = getAllByLabelText(getMsg('optionWatchInputDelete'));
        await fireEvent.click(DelBtn[0]);
        await waitFor(() => {
            expect(storage.removeSubreddits).toHaveBeenCalledWith([subList[0].id]);
        });
    });
});
