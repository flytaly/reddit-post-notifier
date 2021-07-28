<script lang="ts">
    import { onMount } from 'svelte';
    import { TARGET } from '../../../constants';
    import { connectToBg, onMessage, sendToBg } from '../../../port';
    import getMsg from '../../../utils/get-message';

    let helloStr = `Hello world! This is ${TARGET}. ${getMsg('name')}`;
    let msg = '';

    onMount(() => {
        connectToBg('popup');
        sendToBg('UPDATE_NOW');
        onMessage('UPDATING_START', () => {
            msg = 'updating';
        });
    });
</script>

<div class="text-2xl text-blue-500">{helloStr}</div>
<div>Message: {msg}</div>

<style global lang="postcss">
    @import './Popup.pcss';
    @import '../../../../node_modules/nprogress/nprogress.css';
</style>
