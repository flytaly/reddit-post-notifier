/* eslint-disable @typescript-eslint/unbound-method */
import { cleanup, fireEvent, render, waitFor } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import browser from 'webextension-polyfill';

import { sendMessage } from '@/messaging';
import DEFAULT_OPTIONS from '@/options-default';
import type { notificationSoundFiles } from '@/sounds';
import { dataFields } from '@/storage/fields';
import storage from '@/storage/storage';
import type { ExtensionOptions } from '@/types/extension-options';
import applyTheme from '@/utils/apply-theme';
import getMsg from '@/utils/get-message';

import GeneralSettingsBlock from './GeneralSettingsBlock.svelte';

vi.mock('@/storage/storage.ts');
vi.mock('@/utils/get-message.ts');
vi.mock('@/utils/apply-theme.ts');
vi.mock('@/messaging');

function mockStorageData(opts?: Partial<ExtensionOptions>) {
    vi.mocked(storage).getAllData.mockResolvedValue({
        ...dataFields,
        options: { ...DEFAULT_OPTIONS, ...(opts || {}) },
    });
}

function optionSaved(opt: Partial<ExtensionOptions>) {
    expect(storage.saveOptions).toHaveBeenCalledWith(opt);
}

describe('General Options', async () => {
    beforeEach(() => {
        vi.mocked(browser.storage.onChanged.addListener).mockImplementation(() => {});
    });

    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    test('Update interval', async () => {
        const updateInterval = 100;

        mockStorageData({ updateInterval });

        const { getByLabelText } = render(GeneralSettingsBlock);

        const input = getByLabelText(getMsg('optionUpdateInterval'), { exact: false });
        expect(input).toBeInTheDocument();
        await waitFor(() => {
            expect(input).toHaveValue(updateInterval);
        });
        await fireEvent.input(input, { target: { value: 30 } });
        optionSaved({ updateInterval: 30 });
        expect(sendMessage).toHaveBeenCalledWith('SCHEDULE_NEXT_UPDATE');
        // not less than 10 sec
        await fireEvent.input(input, { target: { value: 5 } });
        optionSaved({ updateInterval: 10 });
    });

    test('Theme', async () => {
        const check = (theme: ExtensionOptions['theme']) => {
            expect(form).toHaveFormValues({ theme });
            expect(applyTheme).toHaveBeenCalledWith(theme);
            optionSaved({ theme });
        };
        mockStorageData({ theme: 'purple' });
        const { getByLabelText } = render(GeneralSettingsBlock);
        const auto = getByLabelText(getMsg('optionThemeAuto'));
        const form: HTMLFormElement | null = auto.closest('form');
        await waitFor(() => {
            expect(form).toBeInTheDocument();
            expect(form).toHaveFormValues({ theme: 'purple' });
        });
        await fireEvent.click(getByLabelText(getMsg('optionThemeLight')));
        check('light');
        await fireEvent.click(getByLabelText(getMsg('optionThemeDark')));
        check('dark');
        await fireEvent.click(getByLabelText(getMsg('optionThemePurple')));
        check('purple');
        await fireEvent.click(auto);
        check('auto');
    });

    test('delete post after click', async () => {
        mockStorageData();
        const { getByLabelText } = render(GeneralSettingsBlock);
        await tick();

        const input = getByLabelText(getMsg('optionDelPostAfterClick'), { exact: false });
        expect(input).not.toBeChecked();
        await fireEvent.click(input);
        optionSaved({ delPostAfterBodyClick: true });
    });

    test('delete list after click', async () => {
        mockStorageData();
        const { getByLabelText } = render(GeneralSettingsBlock);
        await tick();

        const input = getByLabelText(getMsg('optionDelListAfterClick'), { exact: false });
        expect(input).not.toBeChecked();
        await fireEvent.click(input);
        optionSaved({ delListAfterOpening: true });
    });

    test('hide empty groups', async () => {
        mockStorageData();
        const { getByLabelText } = render(GeneralSettingsBlock);
        await tick();
        const input = getByLabelText(getMsg('optionHideEmptyGroupsDescription'), { exact: false });
        expect(input).not.toBeChecked();
        await fireEvent.click(input);
        optionSaved({ hideEmptyGroups: true });
    });

    test('notification sound', async () => {
        mockStorageData();
        const { getByLabelText } = render(GeneralSettingsBlock);
        await tick();
        const select = getByLabelText(getMsg('optionNotificationAudioId'), { exact: false });
        expect(select).toHaveValue('null');
        const id = 'sound_01' as keyof typeof notificationSoundFiles;
        await fireEvent.change(select, { target: { value: id } });
        optionSaved({ notificationSoundId: id });
        await fireEvent.change(select, { target: { value: null } });
        optionSaved({ notificationSoundId: null });
    });

    test('change reddit url', async () => {
        mockStorageData({ redditUrlType: 'new' });
        const { getByLabelText, getByTestId } = render(GeneralSettingsBlock);
        const defaultPath = getByLabelText('default');
        const form: HTMLFormElement | null = defaultPath.closest('form');
        await waitFor(() => {
            expect(form).toBeInTheDocument();
            expect(form).toHaveFormValues({ redditUrlType: 'new' });
        });
        const check = (redditUrlType: ExtensionOptions['redditUrlType']) => {
            expect(form).toHaveFormValues({ redditUrlType });
            optionSaved({ redditUrlType });
        };
        await fireEvent.click(getByLabelText('old'));
        check('old');
        await fireEvent.click(getByLabelText('default'));
        check('new');
        await fireEvent.click(getByLabelText('custom URL'));
        check('custom');

        const inputElem = getByTestId('redditUrlInput');
        expect(inputElem).toHaveValue(DEFAULT_OPTIONS.customRedditUrl);
        const value = 'https://localhost:3000/';
        await fireEvent.input(inputElem, { target: { value } });
        await fireEvent.click(getByTestId('saveUrlBtn'));
        optionSaved({ customRedditUrl: value });
    });
});
