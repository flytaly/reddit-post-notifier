<script>
    import { onMount } from 'svelte';
    import { getMsg } from '../../utils';
    import { routes } from '../route';
    import OptionItem from './option-item.svelte';
    import storage from '../../storage';

    onMount(() => {
        if (window.location.hash) document.body.querySelector(window.location.hash)?.scrollIntoView();
    });

    export let options;

    let { updateInterval } = options;
    const { sections } = routes.settings;

    const onUpdateIntervalChange = () => {
        const n = parseInt(updateInterval, 10);
        if (n && n >= 2) {
            return storage.saveOptions({ updateInterval });
        }
    };
</script>

<style>
    .settings-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 100%;
    }
</style>

<div class="settings-container">
    <h1 id={routes.settings.id}>{routes.settings.name}</h1>
    <h2 id={sections.general.id}>{sections.general.name}</h2>
    <sections>
        <OptionItem title={getMsg('optionUpdateInterval')}>
            <div slot="description">{getMsg('optionUpdateIntervalDescription')}</div>
            <div slot="controls">
                <input
                    type="number"
                    min="2"
                    max="3600"
                    size="8"
                    bind:value={updateInterval}
                    on:input={onUpdateIntervalChange} />
            </div>
        </OptionItem>
    </sections>
    <h2 id={sections.mail.id}>{sections.mail.name}</h2>
    <h2 id={sections.subreddit.id}>{sections.subreddit.name}</h2>
    <h2 id={sections['reddit-search'].id}>{sections['reddit-search'].name}</h2>
</div>
