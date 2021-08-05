<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import type { Unsubscriber } from 'svelte/store';
    import storage from '../../../storage/storage';
    import { pageInfo } from '../routes';
    import GeneralSettingsBlock from './GeneralSettingsBlock.svelte';
    import Heading from './Heading.svelte';

    let destroy: Unsubscriber;
    onMount(() => {
        destroy = pageInfo.subscribe(({ sectionId }) => {
            if (sectionId !== '#settings') document.querySelector(sectionId)?.scrollIntoView();
            else window.scrollTo(0, 0);
        });
    });
    onDestroy(() => void destroy());
</script>

<div>
    {#await storage.getAllData() then data}
        <Heading id={'#settings'} level={1} />
        <section>
            <Heading id={'#settings__general'} />
            <GeneralSettingsBlock options={data.options} />
        </section>
        <div class="h-screen" />
    {/await}
</div>

<style lang="postcss">
    section {
        @apply mb-4;
    }
</style>
