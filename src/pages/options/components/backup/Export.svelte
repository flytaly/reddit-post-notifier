<script lang="ts">
    import storage from '@/storage';
    import { CopyIcon, CheckMarkIcon, JsonIcon } from '@options/lib/icons';
    import IosCheckbox from '../common/IosCheckbox.svelte';
    import Heading from '../Heading.svelte';

    let wasCopied = false;
    let withAccs = false;
    let dataPromise: Promise<string>;

    $: dataPromise = storage.getExportData(withAccs).then((d) => JSON.stringify(d, null, 2));

    function downloadText(text: string, filename = 'file.txt', type = 'text/plain') {
        const element = document.createElement('a');
        const file = new Blob([text], {
            type: `${type};charset=utf-8`,
        });
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
    }

    function setClipboard(text: string) {
        const type = 'text/plain';
        const blob = new Blob([text], { type });
        const data = [new ClipboardItem({ [type]: blob })];

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
    <Heading id="export" name={'Export config'} />
    <div class="my-2 max-w-max">
        <IosCheckbox bind:checked={withAccs} title="Include accounts data">
            <span class="text-sm">Include accounts data</span>
        </IosCheckbox>
        {#if withAccs}
            <div class="font-semibold text-skin-accent">
                Caution! Don't share access and refresh tokens for your Reddit accounts!
            </div>
        {/if}
    </div>
    <div>
        <div>
            <div class="flex justify-end space-x-4 rounded-t-md border border-b-0 border-skin-base bg-skin-bg2 p-1">
                {#await dataPromise}
                    <div class="mr-auto">Loading</div>
                {:then data}
                    <button
                        class="flex items-center border-none bg-transparent py-0 px-1 hover:bg-transparent hover:text-skin-accent disabled:cursor-default"
                        class:success={wasCopied}
                        on:click={() => setClipboard(data)}
                        disabled={wasCopied}
                    >
                        <div class="mr-[0.125rem] h-5 w-5">{@html wasCopied ? CheckMarkIcon : CopyIcon}</div>
                        {wasCopied ? 'copied' : 'copy'}
                    </button>
                    <button
                        class="flex items-center border-none bg-transparent py-0 px-1 hover:bg-transparent hover:text-skin-accent disabled:cursor-default"
                        on:click={() => downloadText(data, 'reddit-post-notifier_config.json', 'application/json')}
                    >
                        <div class="h-5 w-5">
                            {@html JsonIcon}
                        </div>
                        export</button
                    >
                {/await}
            </div>
            <div
                class="h-56 w-full overflow-y-scroll whitespace-pre-wrap rounded-b-md border border-skin-base p-1 font-mono"
            >
                {#await dataPromise}
                    <div class="h-60 w-full">Loading</div>
                {:then data}
                    {data}
                {/await}
            </div>
        </div>
    </div>
</section>

<style lang="postcss">
    .success {
        @apply text-skin-success hover:text-skin-success;
    }
</style>
