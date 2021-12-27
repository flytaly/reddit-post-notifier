<script lang="ts">
    import { browser } from 'webextension-polyfill-ts';
    import RefreshIcon from '@assets/refresh.svg';
    import SettingsIcon from '@assets/settings.svg';
    import { sendToBg } from '@/port';
    import getMsg from '@/utils/get-message';
    import { isUpdating } from '../store/store';
    import SvgButton from './SvgButton.svelte';

    let loading = false;

    $: loading = $isUpdating;

    const onOptionClick = async () => {
        await browser.runtime.openOptionsPage();
        window.close();
    };
</script>

<header class="flex items-center p-1 min-h-[1.2rem] border-b border-skin-delimiter">
    <span class="flex flex-1 items-center space-x-2">
        <SvgButton
            disabled={loading}
            on:click={() => sendToBg('UPDATE_NOW')}
            title={getMsg('headerUpdateBtn_title')}
            text={loading ? 'updating' : 'update'}
        >
            <span class={`flex ${loading ? 'animate-spin' : ''}`}>
                {@html RefreshIcon}
            </span>
        </SvgButton>
    </span>

    <span class="flex items-center space-x-3">
        <SvgButton
            text={getMsg('headerOptionsBtn')}
            on:click={onOptionClick}
            title={getMsg('headerOptionsBtn_title')}
            w="1.1rem"
        >
            {@html SettingsIcon}
        </SvgButton>
    </span>
</header>
