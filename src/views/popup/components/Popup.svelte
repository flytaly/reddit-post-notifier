<script lang="ts">
    import nProgress from 'nprogress';
    import { onMount } from 'svelte';
    import { browser } from 'webextension-polyfill-ts';
    import applyTheme from '../../../utils/apply-theme';
    import Header from './Header.svelte';
    import { storageData } from '../store/store';

    console.log($storageData);
    onMount(() => {
        void applyTheme();
        nProgress.configure({ showSpinner: false });
    });

    const openOptions = async () => {
        await browser.runtime.openOptionsPage();
        window.close();
    };
</script>

<!-- <Header {loading} messagesCount={messages.count} /> -->
<Header />
<main class="flex flex-col flex-1 min-w-[13rem] min-h-[4rem]">Main</main>

<style global lang="postcss">
    @import './Popup.pcss';
    @import '../../../../node_modules/nprogress/nprogress.css';
</style>
