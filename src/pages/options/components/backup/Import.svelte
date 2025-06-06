<script lang='ts'>
    import { onMount } from 'svelte';
    import Heading from '../Heading.svelte';
    import storage from '@/storage';
    import type { StorageFields } from '@/storage/storage-types';

    let data: string = $state('');
    let errMessage: string = $state('');
    let importing: boolean = $state(false);
    let wasImported: boolean = $state(false);

    let fileInput: HTMLInputElement;

    onMount(() => {
        fileInput.addEventListener('change', (e: Event) => {
            if (!(e.currentTarget instanceof HTMLInputElement))
                return;
            const { files } = e.currentTarget;
            if (!files?.length)
                return;
            const file = files[0];
            file.text()
                .then((content) => {
                    data = content;
                    void onImport();
                })
                .catch((e) => {
                    errMessage = e.message;
                });
        });
    });

    async function onImport() {
        importing = true;
        try {
            if (!data)
                return;
            const parsed = JSON.parse(data) as Partial<StorageFields>;
            await storage.importData(parsed);
            wasImported = true;
        }
        catch (error) {
            errMessage = (error as Error).message;
        }
        importing = false;
    }
</script>

<section class='mb-8 text-sm'>
    <Heading id='import' name='Import config' />
    <div
        class='flex items-center justify-between space-x-4 rounded-t-md border border-b-0 border-skin-border bg-skin-bg2 p-1'
    >
        <span class='text-sm'>Paste configuration below or import from a file</span>
        <label
            class='flex items-center border-none bg-transparent px-1 py-0 hover:bg-transparent hover:text-skin-accent disabled:cursor-default'
            for='import-file'
        >
            <input type='file' accept='application/json' id='import-file' bind:this={fileInput} />
        </label>
    </div>
    <textarea
        class="w-full border border-skin-border bg-skin-input font-mono ring-skin-outline focus-visible:outline-none focus-visible:ring-1"
        name='import-conf'
        cols='35'
        rows='10'
        bind:value={data}
        onchange={() => {
            errMessage = '';
            wasImported = false;
        }}
    ></textarea>
    <button class='standard-button' onclick={() => void onImport()} disabled={importing}>Import</button>
    {#if errMessage}
        <div class='text-skin-error'>{errMessage}</div>
    {/if}
    {#if wasImported}
        <div class='text-skin-success'>successfully imported</div>
    {/if}
</section>
