<script lang="ts">
    import { sendToBg } from '../../../port';
    import storage from '../../../storage';
    import type { ExtensionOptions } from '../../../types/extension-options';
    import applyTheme from '../../../utils/apply-theme';
    import getMsg from '../../../utils/get-message';
    import OptionsItem from './OptionsItem.svelte';
    import RadioGroup from './RadioGroup.svelte';

    export let options: ExtensionOptions;
    let { updateInterval, theme } = options;

    const themeValueList: Array<{ value: ExtensionOptions['theme']; id: string; label: string }> = [
        { value: 'light', id: 'light', label: getMsg('optionThemeLight') },
        { value: 'dark', id: 'dark', label: getMsg('optionThemeDark') },
        { value: 'purple', id: 'purple', label: getMsg('optionThemePurple') },
        { value: 'auto', id: 'auto', label: getMsg('optionThemeAuto') },
    ];

    const onUpdateIntervalChange = async () => {
        if (updateInterval && updateInterval >= 2) {
            await storage.saveOptions({ updateInterval });
            sendToBg('SCHEDULE_NEXT_UPDATE');
        }
    };

    const onThemeChange = (newTheme: ExtensionOptions['theme']) => {
        void applyTheme(newTheme);
        void storage.saveOptions({ theme: newTheme });
    };
</script>

<OptionsItem title={getMsg('optionUpdateInterval')} labelFor="updateIntervalInput">
    <div slot="description">{getMsg('optionUpdateIntervalDescription')}</div>
    <div slot="controls">
        <input
            id="updateIntervalInput"
            type="number"
            min="2"
            max="3600"
            size="8"
            bind:value={updateInterval}
            on:input={onUpdateIntervalChange}
        />
    </div>
</OptionsItem>

<OptionsItem title={getMsg('optionTheme')}>
    <div slot="description">{getMsg('optionsThemeDescription')}</div>
    <div slot="controls">
        <RadioGroup initialValue={theme} valueList={themeValueList} onChange={onThemeChange} name="theme" />
    </div>
</OptionsItem>
