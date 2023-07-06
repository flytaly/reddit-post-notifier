<script lang="ts">
    import DEFAULT_OPTIONS from '@/options-default';
    import { sendToBg } from '@/port';
    import { getAudioSrc, notificationSoundFiles } from '@/sounds';
    import storage from '@/storage';
    import type { ExtensionOptions } from '@/types/extension-options';
    import applyTheme from '@/utils/apply-theme';
    import getMsg from '@/utils/get-message';
    import { OpenInNew, PlayIcon, SaveIcon, UploadIcon } from '@options/lib/icons';
    import { storageData } from '@options/lib/store';
    import ChangeUrlInput from './ChangeUrlInput.svelte';
    import OptionsItem from './OptionsItem.svelte';
    import RadioGroup from './RadioGroup.svelte';
    import { IS_CHROME } from '@/constants';

    const themeValueList: Array<{ value: ExtensionOptions['theme']; id: string; label: string }> = [
        { value: 'light', id: 'theme_light', label: getMsg('optionThemeLight') },
        { value: 'dark', id: 'theme_dark', label: getMsg('optionThemeDark') },
        { value: 'purple', id: 'theme_purple', label: getMsg('optionThemePurple') },
        { value: 'auto', id: 'theme_auto', label: getMsg('optionThemeAuto') },
    ];

    const onThemeChange = (newTheme: ExtensionOptions['theme']) => {
        void applyTheme(newTheme);
        void storage.saveOptions({ theme: newTheme });
    };

    const intervalList: Array<{ value: string; id: string; label: string }> = [
        { value: String(60), id: 'update_1m', label: '1m' },
        { value: String(5 * 60), id: 'update_5m', label: '5m' },
        { value: String(10 * 60), id: 'update_10m', label: '10m' },
        { value: String(15 * 60), id: 'update_15m', label: '15m' },
        { value: String(30 * 60), id: 'update_30m', label: '30m' },
        { value: String(60 * 60), id: 'update_1h', label: '1h' },
        { value: 'custom', id: 'update_custom', label: 'custom' },
    ];

    const isCustomInterval = () =>
        intervalList.findIndex((i) => i.value === String($storageData.options.updateInterval)) === -1;

    let wasUploaded = false;
    let audioErrMsg = '';
    let intervalValue = 'custom';
    let showCustomIntervalInput = isCustomInterval();

    $: intervalValue = isCustomInterval() ? 'custom' : String($storageData.options.updateInterval);

    const updateInterval = async (value: number) => {
        if (!value) return;
        await storage.saveOptions({ updateInterval: Math.max(10, value) });
        sendToBg('SCHEDULE_NEXT_UPDATE');
    };

    const intervalRadioInputHandler = async (value: string) => {
        if (value === 'custom') {
            showCustomIntervalInput = true;
            return;
        }

        await updateInterval(parseInt(value) || DEFAULT_OPTIONS.updateInterval);
        showCustomIntervalInput = false;
    };

    const intervalCustomInputHandler = (e: Event & { currentTarget: HTMLInputElement }) => {
        void updateInterval(parseInt(e.currentTarget.value));
    };

    const playAudio = async (src: string) => {
        try {
            const audio = new Audio();
            audio.src = src;
            await audio.play();
            return true;
        } catch (error) {
            audioErrMsg = error?.message;
        }
        return false;
    };

    const getSoundAndPlay = async () => {
        const src = await getAudioSrc($storageData.options.notificationSoundId);
        await playAudio(src);
    };

    async function saveFile(event: ProgressEvent<FileReader>) {
        audioErrMsg = '';
        const dataUrl = event.target?.result as string;
        if (!dataUrl) return;
        if (!(await playAudio(dataUrl))) return;

        void storage.saveAudioFile(dataUrl).then(() => {
            wasUploaded = true;
            setTimeout(() => (wasUploaded = false), 2000);
        });
    }

    const onFilesDrop = async (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
        const fl = e.currentTarget?.files as FileList;
        if (!fl?.length) return;
        const file = fl[0];
        const reader = new FileReader();
        reader.addEventListener('load', (ev) => {
            void saveFile(ev);
        });
        reader.readAsDataURL(file);
    };

    const onBadgeClickChangeHandler = async () => {
        const value = $storageData.options.onBadgeClick || 'popup';
        await storage.saveOptions({ onBadgeClick: value });
    };
</script>

<OptionsItem title={getMsg('optionUpdateInterval')} labelFor="updateIntervalInput">
    <div slot="description">
        <p>
            {getMsg('optionUpdateIntervalDescription')}
        </p>
        {#if IS_CHROME}
            <p>
                {getMsg('optionUpdateIntervalDescriptionChrome')}
            </p>
        {/if}
    </div>
    <div slot="controls">
        <RadioGroup onChange={intervalRadioInputHandler} valueList={intervalList} currentValue={intervalValue} />
        <div class="ml-auto mt-2 flex items-baseline justify-end gap-2">
            <input
                id="updateIntervalInput"
                type="number"
                min="10"
                max="7200"
                size="8"
                bind:value={$storageData.options.updateInterval}
                on:input={intervalCustomInputHandler}
            />
            <span>seconds</span>
        </div>
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
        <div class="flex items-stretch justify-end">
            <select
                name="sound"
                id="soundSelect"
                class="w-max"
                bind:value={$storageData.options.notificationSoundId}
                on:change={() => storage.saveOptions({ notificationSoundId: $storageData.options.notificationSoundId })}
            >
                <option value={null}>No sound</option>
                {#each Object.keys(notificationSoundFiles) as soundFileId, idx}
                    <option value={soundFileId}>{`Sound ${idx + 1}`}</option>
                {/each}
                <option value="custom">Custom sound file</option>
            </select>
            <button class="standard-button play-btn" on:click={getSoundAndPlay} title="play">
                {@html PlayIcon}
            </button>
        </div>
        <div>
            {#if $storageData.options.notificationSoundId === 'custom'}
                <span class="text-left text-skin-error">{audioErrMsg}</span>
                <form class="mt-2 flex flex-col">
                    <label
                        for="fileElem"
                        class={`flex w-full items-center justify-center border-2 border-dashed border-skin-gray2 p-1 py-4 text-center hover:border-skin-accent hover:text-skin-accent`}
                    >
                        {#if wasUploaded}
                            <span class="mr-2 h-6 w-6 text-skin-success">{@html SaveIcon}</span>
                            <span>Saved</span>
                        {:else}
                            <span class="mr-2 h-6 w-6">{@html UploadIcon}</span>
                            <span>Click here to upload a file</span>
                        {/if}
                    </label>

                    <input
                        class="hidden"
                        type="file"
                        id="fileElem"
                        accept="audio/*"
                        on:change={onFilesDrop}
                        disabled={false}
                    />
                </form>
            {/if}
        </div>
    </div>
</OptionsItem>

<ChangeUrlInput />

<OptionsItem title={'Badge click action'}>
    <div slot="description">Change behavior when clicking on the extension icon in the toolbar.</div>
    <div slot="controls">
        <select
            name="onBadgeClick"
            id="badgeClickSelect"
            class="w-max"
            bind:value={$storageData.options.onBadgeClick}
            on:change={onBadgeClickChangeHandler}
        >
            <option value="popup">Open Popup</option>
            <option value="openall">Open all unread items</option>
        </select>
    </div>
</OptionsItem>

<style lang="postcss">
    .play-btn {
        @apply ml-1 flex items-center bg-skin-input;
    }

    .play-btn :global(svg) {
        width: 1.3rem;
        height: 1.3rem;
    }
</style>
