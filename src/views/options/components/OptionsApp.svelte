<script lang="ts">
    import { onMount } from 'svelte';
    import { connectToBg, onMessage, sendToBg } from '../../../port';
    let msg = '';
    onMount(() => {
        connectToBg('options');
        sendToBg('SCHEDULE_NEXT_UPDATE');

        onMessage('UPDATING_START', () => {
            msg = 'updating';
        });
    });
</script>

<h1 class="">Options</h1>
<b>{msg}</b>

<style global lang="postcss">
    @import '../../../../node_modules/tippy.js/dist/tippy.css';
</style>
