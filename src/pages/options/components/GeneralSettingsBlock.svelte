<script lang="ts">
    import { sendToBg } from '@/port';
    import { notificationSoundFiles } from '@/sounds';
    import storage from '@/storage';
    import type { ExtensionOptions } from '@/types/extension-options';
    import applyTheme from '@/utils/apply-theme';
    import getMsg from '@/utils/get-message';
    import { OpenInNew, PlayIcon } from '@/pages/options/icons';
    import { browser } from 'webextension-polyfill-ts';
    import OptionsItem from './OptionsItem.svelte';
    import RadioGroup from './RadioGroup.svelte';
    import { storageData } from '@/pages/options/store';

    const themeValueList: Array<{ value: ExtensionOptions['theme']; id: string; label: string }> = [
        { value: 'light', id: 'light', label: getMsg('optionThemeLight') },
        { value: 'dark', id: 'dark', label: getMsg('optionThemeDark') },
        { value: 'purple', id: 'purple', label: getMsg('optionThemePurple') },
        { value: 'auto', id: 'auto', label: getMsg('optionThemeAuto') },
    ];

    const onUpdateIntervalChange = async () => {
        const { updateInterval } = $storageData.options;
        if (updateInterval && updateInterval >= 2) {
            await storage.saveOptions({ updateInterval });
            sendToBg('SCHEDULE_NEXT_UPDATE');
        }
    };

    const onThemeChange = (newTheme: ExtensionOptions['theme']) => {
        void applyTheme(newTheme);
        void storage.saveOptions({ theme: newTheme });
    };

    const playSound = () => {
        const file: string = notificationSoundFiles[$storageData.options.notificationSoundId];
        if (file) {
            const audio = new Audio();
            audio.src = browser.runtime.getURL(file);
            void audio.play();
        }
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
            bind:value={$storageData.options.updateInterval}
            on:input={onUpdateIntervalChange}
        />
    </div>
</OptionsItem>

<OptionsItem title={getMsg('optionTheme')}>
    <div slot="description">{getMsg('optionsThemeDescription')}</div>
    <div slot="controls">
        <RadioGroup
            bind:currentValue={$storageData.options.theme}
            valueList={themeValueList}
            onChange={onThemeChange}
            name="theme"
        />
    </div>
</OptionsItem>

<OptionsItem title={getMsg('optionDelPostAfterClick')} labelFor="deletePostInput">
    <div slot="description">{getMsg('optionDelPostAfterClickDescription')}</div>
    <div slot="controls">
        <input
            id="deletePostInput"
            type="checkbox"
            bind:checked={$storageData.options.delPostAfterBodyClick}
            on:change={() => storage.saveOptions({ delPostAfterBodyClick: $storageData.options.delPostAfterBodyClick })}
        />
    </div>
</OptionsItem>

<OptionsItem title={getMsg('optionDelListAfterClick')} labelFor="deleteListInput">
    <div slot="description">
        <span class="inline-block">
            <span>{getMsg('optionDelListAfterClickDescription')}</span>
            <span class="inline-block w-4">{@html OpenInNew}</span>
        </span>
    </div>
    <div slot="controls">
        <input
            id="deleteListInput"
            type="checkbox"
            bind:checked={$storageData.options.delListAfterOpening}
            on:change={() => storage.saveOptions({ delListAfterOpening: $storageData.options.delListAfterOpening })}
        />
    </div>
</OptionsItem>

<OptionsItem title={getMsg('optionHideEmptyGroups')} labelFor="hideEmptyInput">
    <div slot="description">{getMsg('optionHideEmptyGroupsDescription')}</div>
    <div slot="controls">
        <input
            id="hideEmptyInput"
            type="checkbox"
            bind:checked={$storageData.options.hideEmptyGroups}
            on:change={() => storage.saveOptions({ hideEmptyGroups: $storageData.options.hideEmptyGroups })}
        />
    </div>
</OptionsItem>

<OptionsItem title={getMsg('optionNotificationAudioId')} labelFor="soundSelect">
    <div slot="description">{getMsg('optionNotificationAudioIdDescription')}</div>
    <div slot="controls">
        <div class="flex items-stretch">
            <select
                name="sound"
                id="soundSelect"
                bind:value={$storageData.options.notificationSoundId}
                on:change={() => storage.saveOptions({ notificationSoundId: $storageData.options.notificationSoundId })}
            >
                <option value={null}>No sound</option>
                {#each Object.keys(notificationSoundFiles) as soundFileId, idx}
                    <option value={soundFileId}>{`Sound ${idx + 1}`}</option>
                {/each}
            </select>
            <button class="play-btn" on:click={playSound} title="play">
                {@html PlayIcon}
            </button>
        </div>
    </div>
</OptionsItem>

<OptionsItem title={getMsg('optionUseOldReddit')} labelFor="useOldReddit">
    <div slot="description">{getMsg('optionUseOldRedditDescription')}</div>
    <div slot="controls">
        <input
            id="useOldReddit"
            type="checkbox"
            bind:checked={$storageData.options.useOldReddit}
            on:change={() => storage.saveOptions({ useOldReddit: $storageData.options.useOldReddit })}
        />
    </div>
</OptionsItem>

<style lang="postcss">
    .play-btn {
        @apply flex items-center bg-skin-input ml-1;
    }

    .play-btn :global(svg) {
        width: 1.3rem;
        height: 1.3rem;
    }
</style>
