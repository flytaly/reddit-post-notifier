<script>
    import OptionItem from './option-item.svelte';
    import { getMsg } from '../../utils';
    import PlayIcon from '../../assets/play.svg';
    import { notificationSoundFiles } from '../../sounds';
    import storage from '../../storage';

    export let notificationSoundId;

    const inputHandler = () => storage.saveOptions({ notificationSoundId });
    const clickHandler = () => {
        const file = notificationSoundFiles[notificationSoundId];
        if (file) {
            const audio = new Audio();
            audio.src = browser.runtime.getURL(file);
            audio.play();
        }
    };
</script>

<style>
    .sound-controls {
        display: flex;
        flex-direction: row;
        align-items: stretch;
    }
    .sound-controls button {
        display: flex;
        align-items: center;
        margin-left: 0.4rem;
    }
    .sound-controls button :global(svg) {
        width: 1.3rem;
        height: 1.3rem;
    }
</style>

<OptionItem title={getMsg('optionNotificationAudioId')} labelFor="soundSelect">
    <div slot="description">{getMsg('optionNotificationAudioIdDescription')}</div>
    <div slot="controls">
        <div class="sound-controls">
            <!-- svelte-ignore a11y-no-onchange -->
            <select name="cars" id="soundSelect" bind:value={notificationSoundId} on:change={inputHandler}>
                <option value={null}>No sound</option>
                {#each Object.keys(notificationSoundFiles) as soundFileId, idx}
                    <option value={soundFileId}>{`Sound ${idx + 1}`}</option>
                {/each}
            </select>
            <button on:click={clickHandler}>
                {@html PlayIcon}
            </button>
        </div>
    </div>
</OptionItem>
