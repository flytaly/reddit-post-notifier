/* eslint-disable @typescript-eslint/unbound-method */
import GeneralSettingsBlock from '../components/GeneralSettingsBlock.svelte';
import { fireEvent, render } from '@testing-library/svelte';
import DEFAULT_OPTIONS from '../../../options-default';
import getMsg from '../../../utils/get-message';
import storage from '../../../storage/storage';
import { sendToBg } from '../../../port';
import type { ExtensionOptions } from '../../../types/extension-options';
import applyTheme from '../../../utils/apply-theme';

jest.mock('../../../storage/storage.ts');
jest.mock('../../../utils/get-message.ts');
jest.mock('../../../utils/apply-theme.ts');
jest.mock('../../../port');

describe('General Options', () => {
    test('Update interval', async () => {
        //
        const { getByLabelText } = render(GeneralSettingsBlock, { options: DEFAULT_OPTIONS });
        const input = getByLabelText(getMsg('optionUpdateInterval'), { exact: false });
        expect(input).toBeInTheDocument();
        expect(input).toHaveValue(DEFAULT_OPTIONS.updateInterval);
        await fireEvent.input(input, { target: { value: 90 } });
        expect(storage.saveOptions).toBeCalledWith({ updateInterval: 90 });
        expect(sendToBg).toHaveBeenCalledWith('SCHEDULE_NEXT_UPDATE');
        jest.clearAllMocks();
        // less than 2 sec
        await fireEvent.input(input, { target: { value: 1 } });
        expect(storage.saveOptions).not.toBeCalledWith({ updateInterval: 1 });
        expect(sendToBg).not.toHaveBeenCalledWith('SCHEDULE_NEXT_UPDATE');
    });

    test('Theme', async () => {
        const check = (theme: ExtensionOptions['theme']) => {
            expect(form).toHaveFormValues({ theme });
            expect(applyTheme).toHaveBeenCalledWith(theme);
            expect(storage.saveOptions).toHaveBeenCalledWith({ theme });
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
});
