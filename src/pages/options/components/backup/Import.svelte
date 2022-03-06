<script lang="ts">
    import storage from '@/storage';
    import type { StorageFields } from '@/storage/storage-types';

    import { onMount } from 'svelte';
    import Heading from '../Heading.svelte';

    let data: string;
    let fileInput: HTMLInputElement;
    let errMessage: string = '';
    let importing: boolean = false;
    let wasImported: boolean = false;

    onMount(() => {
        fileInput.addEventListener('change', (e: Event & { currentTarget: HTMLInputElement }) => {
            const { files } = e.currentTarget;
            if (!files?.length) return;
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
            if (!data) return;
            const parsed = JSON.parse(data) as Partial<StorageFields>;
            await storage.importData(parsed);
            wasImported = true;
        } catch (error) {
            errMessage = error.message;
        }
        importing = false;
    }
</script>

<section class="mb-8 text-sm">
    <Heading id="import" name={'Import config'} />
    <div
        class="bg-skin-bg2 flex items-center justify-between space-x-4 border border-b-0 border-skin-base p-1 rounded-t-md"
    >
        <span class="text-sm">Paste configuration below or import from a file</span>
        <label
            class="flex items-center hover:text-skin-accent bg-transparent hover:bg-transparent py-0 px-1 border-none disabled:cursor-default"
            for="import-file"
        >
            <input type="file" accept="application/json" id="import-file" bind:this={fileInput} />
        </label>
    </div>
    <textarea
        name="import-conf"
        cols="35"
        rows="10"
        bind:value={data}
        on:change={() => {
            errMessage = '';
            wasImported = false;
        }}
    />
    <button on:click={() => void onImport()} disabled={importing}>Import</button>
    {#if errMessage}
        <div class="text-skin-error">{errMessage}</div>
    {/if}
    {#if wasImported}
        <div class="text-skin-success">successfully imported</div>
    {/if}
</section>

<style lang="postcss">
    textarea {
        @apply w-full bg-skin-input font-mono border border-skin-base focus-visible:outline-none focus-visible:ring-1 ring-skin-outline;
    }
</style>
