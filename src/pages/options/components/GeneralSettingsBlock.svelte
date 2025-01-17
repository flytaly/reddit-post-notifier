<script lang='ts'>
    import { IS_CHROME } from '@/constants';
    import { sendMessage } from '@/messaging';
    import DEFAULT_OPTIONS from '@/options-default';
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

    const themeValueList: Array<{ value: ExtensionOptions['theme']; id: string; label: string }> = [
        { value: 'light', id: 'theme_light', label: getMsg('optionThemeLight') },
        { value: 'dark', id: 'theme_dark', label: getMsg('optionThemeDark') },
        { value: 'purple', id: 'theme_purple', label: getMsg('optionThemePurple') },
        { value: 'auto', id: 'theme_auto', label: getMsg('optionThemeAuto') },
    ];

    const onThemeChange = (value: string) => {
        const newTheme = value as ExtensionOptions['theme'];
        void applyTheme(newTheme);
        void storage.saveOptions({ theme: newTheme });
    };

    const intervalList: Array<{ value: string; id: string; label: string }> = [
        { value: String(30), id: 'update_30s', label: '30s' },
        { value: String(60), id: 'update_1m', label: '1m' },
        { value: String(5 * 60), id: 'update_5m', label: '5m' },
        { value: String(10 * 60), id: 'update_10m', label: '10m' },
        { value: String(15 * 60), id: 'update_15m', label: '15m' },
        { value: String(30 * 60), id: 'update_30m', label: '30m' },
        { value: String(60 * 60), id: 'update_1h', label: '1h' },
        { value: 'custom', id: 'update_custom', label: 'custom' },
    ];

    const isCustomInterval = () =>
        intervalList.findIndex(i => i.value === String($storageData.options.updateInterval)) === -1;

    let wasUploaded = $state(false);
    let audioErrMsg = $state('');
    let intervalValue = $state('custom');

    $effect(() => {
        intervalValue = isCustomInterval() ? 'custom' : String($storageData.options.updateInterval);
    });

    const updateInterval = async (value: number) => {
        if (!value)
            return;
        await storage.saveOptions({ updateInterval: Math.max(10, value) });
        await sendMessage('SCHEDULE_NEXT_UPDATE');
    };

    const intervalRadioInputHandler = async (value: string) => {
        if (value === 'custom')
            return;

        await updateInterval(Number.parseInt(value) || DEFAULT_OPTIONS.updateInterval);
    };

    const intervalCustomInputHandler = (e: Event & { currentTarget: HTMLInputElement }) => {
        void updateInterval(Number.parseInt(e.currentTarget.value));
    };

    const playAudio = async (src: string) => {
        try {
            const audio = new Audio();
            audio.src = src;
            await audio.play();
            return true;
        }
        catch (error) {
            audioErrMsg = (error as Error)?.message;
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
        if (!dataUrl)
            return;
        if (!(await playAudio(dataUrl)))
            return;

        void storage.saveAudioFile(dataUrl).then(() => {
            wasUploaded = true;
            setTimeout(() => (wasUploaded = false), 2000);
        });
    }

    const onFilesDrop = async (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
        const fl = e.currentTarget?.files as FileList;
        if (!fl?.length)
            return;
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

<OptionsItem title={getMsg('optionUpdateInterval')} labelFor='updateIntervalInput'>
    {#snippet description()}
        <div >
            <p>
                {getMsg('optionUpdateIntervalDescription')}
            </p>
            {#if IS_CHROME}
                <p>
                    {getMsg('optionUpdateIntervalDescriptionChrome')}
                </p>
            {/if}
        </div>
    {/snippet}
    {#snippet controls()}
        <div >
            <RadioGroup onChange={intervalRadioInputHandler} valueList={intervalList} currentValue={intervalValue} />
            <div class='ml-auto mt-2 flex items-baseline justify-end gap-2'>
                <input
                    id='updateIntervalInput'
                    type='number'
                    min='10'
                    max='7200'
                    size='8'
                    bind:value={$storageData.options.updateInterval}
                    oninput={intervalCustomInputHandler}
                />
                <span>seconds</span>
            </div>
        </div>
    {/snippet}
</OptionsItem>

<OptionsItem title={getMsg('optionTheme')}>
    {#snippet description()}
        <div >{getMsg('optionsThemeDescription')}</div>
    {/snippet}
    {#snippet controls()}
        <div >
            <RadioGroup
                bind:currentValue={$storageData.options.theme}
                valueList={themeValueList}
                onChange={onThemeChange}
                name='theme'
            />
        </div>
    {/snippet}
</OptionsItem>

<OptionsItem title={getMsg('optionDelPostAfterClick')} labelFor='deletePostInput'>
    {#snippet description()}
        <div >{getMsg('optionDelPostAfterClickDescription')}</div>
    {/snippet}
    {#snippet controls()}
        <div >
            <input
                id='deletePostInput'
                type='checkbox'
                bind:checked={$storageData.options.delPostAfterBodyClick}
                onchange={() => storage.saveOptions({ delPostAfterBodyClick: $storageData.options.delPostAfterBodyClick })}
            />
        </div>
    {/snippet}
</OptionsItem>

<OptionsItem title={getMsg('optionDelListAfterClick')} labelFor='deleteListInput'>
    {#snippet description()}
        <div >
            <span class='inline-block'>
                <span>{getMsg('optionDelListAfterClickDescription')}</span>
                <span class='inline-block w-4'>{@html OpenInNew}</span>
            </span>
        </div>
    {/snippet}
    {#snippet controls()}
        <div >
            <input
                id='deleteListInput'
                type='checkbox'
                bind:checked={$storageData.options.delListAfterOpening}
                onchange={() => storage.saveOptions({ delListAfterOpening: $storageData.options.delListAfterOpening })}
            />
        </div>
    {/snippet}
</OptionsItem>

<OptionsItem title={getMsg('optionHideEmptyGroups')} labelFor='hideEmptyInput'>
    {#snippet description()}
        <div >{getMsg('optionHideEmptyGroupsDescription')}</div>
    {/snippet}
    {#snippet controls()}
        <div >
            <input
                id='hideEmptyInput'
                type='checkbox'
                bind:checked={$storageData.options.hideEmptyGroups}
                onchange={() => storage.saveOptions({ hideEmptyGroups: $storageData.options.hideEmptyGroups })}
            />
        </div>
    {/snippet}
</OptionsItem>

<OptionsItem title={getMsg('optionNotificationAudioId')} labelFor='soundSelect'>
    {#snippet description()}
        <div >{getMsg('optionNotificationAudioIdDescription')}</div>
    {/snippet}
    {#snippet controls()}
        <div >
            <div class='flex items-stretch justify-end'>
                <select
                    name='sound'
                    id='soundSelect'
                    class='w-max'
                    bind:value={$storageData.options.notificationSoundId}
                    onchange={() => storage.saveOptions({ notificationSoundId: $storageData.options.notificationSoundId })}
                >
                    <option value={null}>No sound</option>
                    {#each Object.keys(notificationSoundFiles) as soundFileId, idx}
                        <option value={soundFileId}>{`Sound ${idx + 1}`}</option>
                    {/each}
                    <option value='custom'>Custom sound file</option>
                </select>
                <button class='standard-button play-btn' onclick={getSoundAndPlay} title='play'>
                    {@html PlayIcon}
                </button>
            </div>
            <div>
                {#if $storageData.options.notificationSoundId === 'custom'}
                    <span class='text-left text-skin-error'>{audioErrMsg}</span>
                    <form class='mt-2 flex flex-col'>
                        <label
                            for='fileElem'
                            class='flex w-full items-center justify-center border-2 border-dashed border-skin-gray2 p-1 py-4 text-center hover:border-skin-accent hover:text-skin-accent'
                        >
                            {#if wasUploaded}
                                <span class='mr-2 h-6 w-6 text-skin-success'>{@html SaveIcon}</span>
                                <span>Saved</span>
                            {:else}
                                <span class='mr-2 h-6 w-6'>{@html UploadIcon}</span>
                                <span>Click here to upload a file</span>
                            {/if}
                        </label>

                        <input
                            class='hidden'
                            type='file'
                            id='fileElem'
                            accept='audio/*'
                            onchange={onFilesDrop}
                            disabled={false}
                        />
                    </form>
                {/if}
            </div>
        </div>
    {/snippet}
</OptionsItem>

<ChangeUrlInput />

<OptionsItem title='Badge click action'>
    {#snippet description()}
        <div >Change behavior when clicking on the extension icon in the toolbar.</div>
    {/snippet}
    {#snippet controls()}
        <div >
            <select
                name='onBadgeClick'
                id='badgeClickSelect'
                class='w-max'
                bind:value={$storageData.options.onBadgeClick}
                onchange={onBadgeClickChangeHandler}
            >
                <option value='popup'>Open Popup</option>
                <option value='openall'>Open all unread items</option>
            </select>
        </div>
    {/snippet}
</OptionsItem>

<style lang='postcss'>
    .play-btn {
        @apply ml-1 flex items-center bg-skin-input;
    }

    .play-btn :global(svg) {
        width: 1.3rem;
        height: 1.3rem;
    }
</style>
