<script lang="ts">
    import storage from '@/storage';
    import { CopyIcon, CheckMarkIcon } from '../icons';

    import Heading from './Heading.svelte';

    const dataPromise = storage.getExportData().then((d) => JSON.stringify(d, null, 2));

    let wasCopied = false;

    function setClipboard(text: string) {
        const type = 'text/plain';
        const blob = new Blob([text], { type });
        const data = [new ClipboardItem({ [type]: blob })];

        console.time('label');
        navigator.clipboard.write(data).then(
            () => {
                wasCopied = true;
                setTimeout(() => {
                    wasCopied = false;
                }, 2000);
            },
            (e) => {
                console.error(e);
            },
        );
    }
</script>

<section class="mb-8">
    <Heading id="import" name={'Import config'} />
    <b>Import</b>
</section>
<section class="mb-8">
    <Heading id="export" name={'Export config'} />
    <div>
        {#await dataPromise}
            <div />
        {:then data}
            <div>
                <div class="bg-skin-bg2 border border-b-0 border-skin-base p-1 rounded-t-md">
                    <button
                        class="flex items-center hover:text-skin-accent bg-transparent hover:bg-transparent py-0 px-1 border-none disabled:cursor-default"
                        class:success={wasCopied}
                        on:click={() => setClipboard(data)}
                        disabled={wasCopied}
                    >
                        <div class="h-5 w-5 mr-[0.125rem]">{@html wasCopied ? CheckMarkIcon : CopyIcon}</div>
                        {wasCopied ? 'copied' : 'copy'}
                    </button>
                </div>
                <div
                    class="border border-skin-base w-full h-[25rem] p-1 rounded-b-md whitespace-pre-wrap overflow-y-scroll font-mono"
                >
                    {data}
                </div>
            </div>
        {/await}
    </div>
</section>
<div class="h-52" />

<style lang="postcss">
    .success {
        @apply text-skin-success hover:text-skin-success;
    }
</style>
