<script lang="ts">
    import storage from '@/storage/storage';
    import getMsg from '@/utils/get-message';
    import { onMount, tick } from 'svelte';
    import { routes } from '../routes';
    import { storageData } from '../store';
    import AccountsBlock from './AccountsBlock.svelte';
    import GeneralSettingsBlock from './GeneralSettingsBlock.svelte';
    import Heading from './Heading.svelte';

    const dataPromise = storage.getAllData();

    onMount(() => {
        // wait for children sections to mount and then scroll based on hash
        void (async () => {
            await dataPromise;
            await tick();
            const { hash } = document.location;
            if (hash) {
                document.body.querySelector(hash)?.scrollIntoView();
            }
        })();
    });

    const s = routes.settings.sections;
</script>

<div class="w-full">
    {#if $storageData.isLoaded}
        <h1 class="mb-4 text-2xl font-bold uppercase tracking-widest text-skin-gray">
            {getMsg('optionsNavSettings')}
        </h1>
        <section class="mb-10">
            <Heading id={s.general.id} name={s.general.name} />
            <GeneralSettingsBlock />
        </section>
        <section class="mb-10">
            <Heading id={s.mail.id} name={getMsg('optionsNavMailFull')} />
            <AccountsBlock />
        </section>
        <div class="h-[80vh]" />
    {/if}
</div>
