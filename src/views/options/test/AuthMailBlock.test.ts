/* eslint-disable @typescript-eslint/unbound-method */
import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { mocked } from 'ts-jest/utils';
import auth from '@/reddit-api/auth';
import storage from '@/storage/storage';
import type { ExtensionOptions } from '@/types/extension-options';
import getMsg from '@/utils/get-message';
import AuthMailBlock from '../components/AuthMailBlock.svelte';

jest.mock('@/storage/storage.ts');
jest.mock('@/utils/get-message.ts');
jest.mock('@/reddit-api/auth.ts');

function optionSaved(opt: Partial<ExtensionOptions>) {
    expect(storage.saveOptions).toHaveBeenCalledWith(opt);
}

const mockStorage = mocked(storage);
describe('Mail and authorization settings', () => {
    afterEach(() => jest.clearAllMocks());

    test('Is authorized state', async () => {
        mockStorage.getAuthData.mockImplementation(async () => ({ refreshToken: 'token' }));
        const { getByText, getByLabelText } = render(AuthMailBlock, { messages: true, messagesNotify: true });
        let btn: HTMLElement;

        await waitFor(async () => {
            btn = getByText(getMsg('optionSignOutBtn'));
            expect(btn).toBeInTheDocument();
            expect(getByText(getMsg('optionIsAuthMsg'))).toBeInTheDocument();
        });

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
    });

    test('Not authorized state', async () => {
        mockStorage.getAuthData.mockImplementation(async () => ({ refreshToken: undefined }));
        const { getByText, getByLabelText } = render(AuthMailBlock, { messages: false, messagesNotify: false });

        await waitFor(async () => {
            const btn = getByText(getMsg('optionStartAuthBtn'));
            expect(btn).toBeInTheDocument();
            expect(getByText(getMsg('optionNoAuthMsg'))).toBeInTheDocument();
            await fireEvent.click(btn);
            expect(auth.login).toHaveBeenCalled();
        });

        const watchmail = getByLabelText(getMsg('optionMailShow'), { exact: false });
        const notify = getByLabelText(getMsg('optionMailNotify'), { exact: false });
        expect(watchmail).toBeDisabled();
        expect(notify).toBeDisabled();
    });
});
