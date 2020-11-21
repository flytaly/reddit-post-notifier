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

    onMount(() => {
        const { hash } = window.location;
        if (!hash || hash === `#${routes.settings.id}`) return window.scrollTo(0, 0);
        document.body.querySelector(hash)?.scrollIntoView();
    });

    export let data; // storage data

    const { sections } = routes.settings;
    const { theme } = data.options;
    let { updateInterval, delPostAfterBodyClick, hideEmptyGroups } = data.options;

    const themeValueList = [
        { value: 'light', id: 'light', label: getMsg('optionThemeLight') }, //
        { value: 'dark', id: 'dark', label: getMsg('optionThemeDark') },
        { value: 'auto', id: 'auto', label: getMsg('optionThemeAuto') },
    ];

    const onUpdateIntervalChange = () => {
        const n = parseInt(updateInterval, 10);
        if (n && n >= 2) {
            return storage.saveOptions({ updateInterval });
        }
    };

    const onThemeChange = (newTheme) => {
        applyTheme(newTheme);
        storage.saveOptions({ theme: newTheme });
    };
</script>

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
        <OptionItem title={getMsg('optionTheme')}>
            <div slot="controls">
                <RadioGroup initialValue={theme} valueList={themeValueList} onChange={onThemeChange} />
            </div>
        </OptionItem>
        <OptionItem title={getMsg('optionDelPostAfterClick')}>
            <div slot="description">{getMsg('optionDelPostAfterClickDescription')}</div>
            <div slot="controls">
                <input
                    type="checkbox"
                    bind:checked={delPostAfterBodyClick}
                    on:change={() => storage.saveOptions({ delPostAfterBodyClick })} />
            </div>
        </OptionItem>
        <OptionItem title={getMsg('optionHideEmptyGroups')}>
            <div slot="description">{getMsg('optionHideEmptyGroupsDescription')}</div>
            <div slot="controls">
                <input
                    type="checkbox"
                    bind:checked={hideEmptyGroups}
                    on:change={() => storage.saveOptions({ hideEmptyGroups })} />
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
            subredditsData={data.subreddits} />
    </sections>
    <sections>
        <h2 id={sections['reddit-search'].id}>{sections['reddit-search'].name}</h2>
        <SearchBlock queriesList={data.queriesList} queriesData={data.queries} />
    </sections>
</div>
