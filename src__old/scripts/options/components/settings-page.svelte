<script>
    import { onMount } from 'svelte';
    import { getMsg } from '../../utils';
    import { routes } from '../route';
    import OptionItem from './option-item.svelte';
    import storage from '../../storage';
    import RadioGroup from './radio-group.svelte';
    import applyTheme from '../../theme';
    import AuthAndMailBlock from './auth-mail-block.svelte';
    import SubredditsBlock from './subreddits-block.svelte';
    import SearchBlock from './search-block.svelte';
    import types from '../../types';
    import NotificationSound from './notification-sound.svelte';

    onMount(() => {
        const { hash } = window.location;
        if (!hash || hash === `#${routes.settings.id}`) {
            window.scrollTo(0, 0);
            return;
        }
        document.body.querySelector(hash)?.scrollIntoView();
    });

    export let data; // storage data

    const bgScriptPort = browser.runtime.connect();
    const { sections } = routes.settings;
    const { theme } = data.options;
    let { updateInterval, delPostAfterBodyClick, hideEmptyGroups, useOldReddit } = data.options;
    const { notificationSoundId } = data.options;

    const themeValueList = [
        { value: 'light', id: 'light', label: getMsg('optionThemeLight') },
        { value: 'dark', id: 'dark', label: getMsg('optionThemeDark') },
        { value: 'purple', id: 'purple', label: getMsg('optionThemePurple') },
        { value: 'auto', id: 'auto', label: getMsg('optionThemeAuto') },
    ];

    const onUpdateIntervalChange = async () => {
        const n = parseInt(updateInterval, 10);
        if (n && n >= 2) {
            await storage.saveOptions({ updateInterval });
            bgScriptPort?.postMessage({ type: types.SCHEDULE_NEXT_UPDATE });
        }
    };

    const onThemeChange = (newTheme) => {
        applyTheme(newTheme);
        storage.saveOptions({ theme: newTheme });
    };
</script>

<div class="settings-container">
    <h1 id={routes.settings.id}>{routes.settings.name}</h1>
    <h2 id={sections.general.id}>{sections.general.name}</h2>
    <sections>
        <OptionItem title={getMsg('optionUpdateInterval')} labelFor="updateIntervalInput">
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
        </OptionItem>
        <OptionItem title={getMsg('optionTheme')}>
            <div slot="description">{getMsg('optionsThemeDescription')}</div>
            <div slot="controls">
                <RadioGroup initialValue={theme} valueList={themeValueList} onChange={onThemeChange} />
            </div>
        </OptionItem>
        <OptionItem title={getMsg('optionDelPostAfterClick')} labelFor="deletePostInput">
            <div slot="description">{getMsg('optionDelPostAfterClickDescription')}</div>
            <div slot="controls">
                <input
                    id="deletePostInput"
                    type="checkbox"
                    bind:checked={delPostAfterBodyClick}
                    on:change={() => storage.saveOptions({ delPostAfterBodyClick })}
                />
            </div>
        </OptionItem>
        <OptionItem title={getMsg('optionHideEmptyGroups')} labelFor="hideEmptyInput">
            <div slot="description">{getMsg('optionHideEmptyGroupsDescription')}</div>
            <div slot="controls">
                <input
                    id="hideEmptyInput"
                    type="checkbox"
                    bind:checked={hideEmptyGroups}
                    on:change={() => storage.saveOptions({ hideEmptyGroups })}
                />
            </div>
        </OptionItem>
        <NotificationSound {notificationSoundId} />
        <OptionItem title={getMsg('optionUseOldReddit')} labelFor="useOldReddit">
            <div slot="description">{getMsg('optionUseOldRedditDescription')}</div>
            <div slot="controls">
                <input
                    id="useOldReddit"
                    type="checkbox"
                    bind:checked={useOldReddit}
                    on:change={() => storage.saveOptions({ useOldReddit })}
                />
            </div>
        </OptionItem>
    </sections>
    <sections>
        <h2 id={sections.mail.id}>{sections.mail.name}</h2>
        <AuthAndMailBlock messages={data.options.messages} messagesNotify={data.options.messagesNotify} />
    </sections>
    <sections>
        <h2 id={sections.subreddit.id}>{sections.subreddit.name}</h2>
        <SubredditsBlock
            subredditNotify={data.options.subredditNotify}
            subredditList={data.subredditList}
            subredditsData={data.subreddits}
        />
    </sections>
    <sections>
        <h2 id={sections['reddit-search'].id}>{sections['reddit-search'].name}</h2>
        <SearchBlock queriesList={data.queriesList} queriesData={data.queries} />
    </sections>
</div>

<style>
    input[type='number'] {
        min-width: 5rem;
    }
    .settings-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 100%;
    }
</style>
