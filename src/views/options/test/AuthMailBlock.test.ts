/* eslint-disable @typescript-eslint/unbound-method */
/* import DEFAULT_OPTIONS from '@/options-default';
import auth from '@/reddit-api/auth'; */
import storage from '@/storage/storage';
/* import type { ExtensionOptions } from '@/types/extension-options';
import getMsg from '@/utils/get-message';
import { tick } from 'svelte'; */
import { dataFields } from '@/storage/fields';
import { mocked } from 'jest-mock';
import AuthMailBlock from '../components/AuthMailBlock.svelte';
import { render } from '@testing-library/svelte';

jest.mock('@/storage/storage.ts');
jest.mock('@/utils/get-message.ts');
jest.mock('@/reddit-api/auth.ts');

/* function optionSaved(opt: Partial<ExtensionOptions>) {
    expect(storage.saveOptions).toHaveBeenCalledWith(opt);
} */

const mockStorage = mocked(storage);

describe('Mail and authorization settings', () => {
    beforeEach(() => {
        mockBrowser.storage.onChanged.addListener.spy(() => ({}));
    });

    afterEach(() => jest.clearAllMocks());

    test('TODO', () => {
        mockStorage.getAllData.mockResolvedValueOnce({
            ...dataFields,
        });
        render(AuthMailBlock);
        expect(false).toBeTruthy();
    });

    /* test('Is authorized state', async () => {
         mockStorage.getAllData.mockResolvedValueOnce({
            ...dataFields,
            refreshToken: 'refreshToken',
            options: { ...DEFAULT_OPTIONS, messages: true, messagesNotify: true },
        });
        const { getByText, getByLabelText } = render(AuthMailBlock);

        await tick();

        const btn = getByText(getMsg('optionSignOutBtn'));
        expect(btn).toBeInTheDocument();
        expect(getByText(getMsg('optionIsAuthMsg'))).toBeInTheDocument();

        const watchmail = getByLabelText(getMsg('optionMailShow'), { exact: false });
        const notify = getByLabelText(getMsg('optionMailNotify'), { exact: false });
        expect(watchmail).toBeChecked();
        expect(notify).toBeChecked();

        await fireEvent.click(notify);
        optionSaved({ messagesNotify: false });

        await fireEvent.click(watchmail);
        optionSaved({ messages: false, messagesNotify: false });

        await fireEvent.click(btn);
        expect(storage.clearAuthData).toHaveBeenCalled(); 
    }); */

    /* test('Not authorized state', async () => {
        mockStorage.getAllData.mockResolvedValueOnce({ ...dataFields });
        const { getByText, getByLabelText } = render(AuthMailBlock);
        await tick();

        const btn = getByText(getMsg('optionStartAuthBtn'));
        expect(btn).toBeInTheDocument();
        expect(getByText(getMsg('optionNoAuthMsg'))).toBeInTheDocument();
        await fireEvent.click(btn);
        expect(auth.login).toHaveBeenCalled();

        const watchmail = getByLabelText(getMsg('optionMailShow'), { exact: false });
        const notify = getByLabelText(getMsg('optionMailNotify'), { exact: false });
        expect(watchmail).toBeDisabled();
        expect(notify).toBeDisabled();
    }); */
});
