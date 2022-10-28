<script lang="ts">
    import getMsg from '@/utils/get-message';
    import { routes } from '@options/lib/routes';
    import { storageData } from '@options/lib/store';
    import GeneralSettingsBlock from './GeneralSettingsBlock.svelte';
    import Heading from './Heading.svelte';
</script>

<div class="w-full">
    {#if $storageData.isLoaded}
        <h1 class="mb-4 text-2xl font-bold uppercase tracking-widest text-skin-gray">
            {getMsg('optionsNavSettings')}
        </h1>
        <section class="mb-10">
            <Heading id={routes.settings.id} name={routes.settings.name} />
            <GeneralSettingsBlock />
        </section>
    {/if}
</div>
