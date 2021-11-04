/* eslint-disable @typescript-eslint/unbound-method */
import GeneralSettingsBlock from '../components/GeneralSettingsBlock.svelte';
import { fireEvent, render } from '@testing-library/svelte';
import DEFAULT_OPTIONS from '@/options-default';
import getMsg from '@/utils/get-message';
import storage from '@/storage/storage';
import { sendToBg } from '@/port';
import type { ExtensionOptions } from '@/types/extension-options';
import applyTheme from '@/utils/apply-theme';
import type { notificationSoundFiles } from '@/sounds';

jest.mock('@/storage/storage.ts');
jest.mock('@/utils/get-message.ts');
jest.mock('@/utils/apply-theme.ts');
jest.mock('@/port');

function optionSaved(opt: Partial<ExtensionOptions>) {
    expect(storage.saveOptions).toHaveBeenCalledWith(opt);
}

describe('General Options', () => {
    afterEach(() => jest.clearAllMocks());

    test('Update interval', async () => {
        //
        const { getByLabelText } = render(GeneralSettingsBlock, { options: DEFAULT_OPTIONS });
        const input = getByLabelText(getMsg('optionUpdateInterval'), { exact: false });
        expect(input).toBeInTheDocument();
        expect(input).toHaveValue(DEFAULT_OPTIONS.updateInterval);
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
        const { getByLabelText } = render(GeneralSettingsBlock, { options: DEFAULT_OPTIONS });
        const auto = getByLabelText(getMsg('optionThemeAuto'));
        const form: HTMLFormElement = auto.closest('form');
        expect(form).toBeInTheDocument();
        expect(form).toHaveFormValues({ theme: 'auto' });

        await fireEvent.click(getByLabelText(getMsg('optionThemeLight')));
        check('light');
        await fireEvent.click(getByLabelText(getMsg('optionThemeDark')));
        check('dark');
        await fireEvent.click(getByLabelText(getMsg('optionThemePurple')));
        check('purple');
        await fireEvent.click(auto);
        check('auto');
    });

    test('delete after click', async () => {
        const { getByLabelText } = render(GeneralSettingsBlock, { options: DEFAULT_OPTIONS });

        const input = getByLabelText(getMsg('optionDelPostAfterClick'), { exact: false });
        expect(input).not.toBeChecked();
        await fireEvent.click(input);
        optionSaved({ delPostAfterBodyClick: true });
    });

    test('hide empty groups', async () => {
        const { getByLabelText } = render(GeneralSettingsBlock, { options: DEFAULT_OPTIONS });
        const input = getByLabelText(getMsg('optionHideEmptyGroupsDescription'), { exact: false });
        expect(input).not.toBeChecked();
        await fireEvent.click(input);
        optionSaved({ hideEmptyGroups: true });
    });

    test('notification sound', async () => {
        const { getByLabelText } = render(GeneralSettingsBlock, { options: DEFAULT_OPTIONS });
        const select = getByLabelText(getMsg('optionNotificationAudioId'), { exact: false });
        expect(select).toHaveValue('null');
        const id = 'sound_01' as keyof typeof notificationSoundFiles;
        await fireEvent.change(select, { target: { value: id } });
        optionSaved({ notificationSoundId: id });
        await fireEvent.change(select, { target: { value: null } });
        optionSaved({ notificationSoundId: null });
    });

    test('use old reddit', async () => {
        const { getByLabelText } = render(GeneralSettingsBlock, { options: DEFAULT_OPTIONS });
        const checkbox = getByLabelText(getMsg('optionUseOldReddit'), { exact: false });
        expect(checkbox).not.toBeChecked();
        await fireEvent.click(checkbox);
        expect(checkbox).toBeChecked();
        optionSaved({ useOldReddit: true });
        await fireEvent.click(checkbox);
        optionSaved({ useOldReddit: false });
    });
});
