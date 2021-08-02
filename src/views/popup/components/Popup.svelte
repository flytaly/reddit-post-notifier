<script lang="ts">
    import nProgress from 'nprogress';

    import { onMount } from 'svelte';
    import { browser } from 'webextension-polyfill-ts';
    import { TARGET } from '../../../constants';
    import { connectToBg, onMessage, sendToBg } from '../../../port';
    import getMsg from '../../../utils/get-message';

    let helloStr = `Hello world! This is ${TARGET}. ${getMsg('name')}`;
    let msg = '';

    onMount(() => {
        nProgress.configure({ showSpinner: false });
        connectToBg('popup');
        sendToBg('UPDATE_NOW');
        onMessage('UPDATING_START', () => void nProgress.start());
        onMessage('UPDATING_END', () => void nProgress.done());
    });
    const openOptions = async () => {
        await browser.runtime.openOptionsPage();
        window.close();
    };
</script>

<button on:click={openOptions}>options</button>

<div class="bg-skin-base text-skin-base">{helloStr}</div>
<div class="">Message: {msg}</div>

<style global lang="postcss">
    @import './Popup.pcss';
    @import '../../../../node_modules/nprogress/nprogress.css';
</style>
