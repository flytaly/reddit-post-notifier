/* eslint-disable @typescript-eslint/unbound-method */
import GeneralSettingsBlock from '../components/GeneralSettingsBlock.svelte';
import { fireEvent, render, waitFor } from '@testing-library/svelte';
import DEFAULT_OPTIONS from '@/options-default';
import getMsg from '@/utils/get-message';
import storage from '@/storage/storage';
import { sendToBg } from '@/port';
import type { ExtensionOptions } from '@/types/extension-options';
import applyTheme from '@/utils/apply-theme';
import type { notificationSoundFiles } from '@/sounds';
import { dataFields } from '@/storage/fields';
import { mocked } from 'jest-mock';
import { tick } from 'svelte';

jest.mock('@/storage/storage.ts');
jest.mock('@/utils/get-message.ts');
jest.mock('@/utils/apply-theme.ts');
jest.mock('@/port');

const mockedStorage = mocked(storage);
const mockStorageData = (opts?: Partial<ExtensionOptions>) => {
    mockedStorage.getAllData.mockResolvedValue({
        ...dataFields,
        options: { ...DEFAULT_OPTIONS, ...(opts || {}) },
    });
};

function optionSaved(opt: Partial<ExtensionOptions>) {
    expect(storage.saveOptions).toHaveBeenCalledWith(opt);
}

describe('General Options', () => {
    beforeEach(() => {
        mockBrowser.storage.onChanged.addListener.spy(() => ({}));
    });

    afterEach(() => {
        return jest.clearAllMocks();
    });

    test('Update interval', async () => {
        const updateInterval = 120;
        mockStorageData({ updateInterval });

        const { getByLabelText } = render(GeneralSettingsBlock);
        const input = getByLabelText(getMsg('optionUpdateInterval'), { exact: false });
        expect(input).toBeInTheDocument();
        await waitFor(() => {
            expect(input).toHaveValue(updateInterval);
        });
        await fireEvent.input(input, { target: { value: 90 } });
        optionSaved({ updateInterval: 90 });
        expect(sendToBg).toHaveBeenCalledWith('SCHEDULE_NEXT_UPDATE');
        jest.clearAllMocks();
        // less than 2 sec
        await fireEvent.input(input, { target: { value: 1 } });
        expect(storage.saveOptions).not.toBeCalled();
        expect(sendToBg).not.toHaveBeenCalledWith('SCHEDULE_NEXT_UPDATE');
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

    test('use old reddit', async () => {
        mockStorageData();
        const { getByLabelText } = render(GeneralSettingsBlock);
        await tick();
        const checkbox = getByLabelText(getMsg('optionUseOldReddit'), { exact: false });
        expect(checkbox).not.toBeChecked();
        await fireEvent.click(checkbox);
        expect(checkbox).toBeChecked();
        optionSaved({ useOldReddit: true });
        await fireEvent.click(checkbox);
        optionSaved({ useOldReddit: false });
    });
});
