<script lang="ts">
    import storage from '@/storage/storage';
    import getMsg from '@/utils/get-message';
    import { onDestroy, onMount, tick } from 'svelte';
    import type { Unsubscriber } from 'svelte/store';
    import { sections } from '../routes';
    import { storageData } from '../store';
    import AccountsBlock from './AccountsBlock.svelte';
    import FollowUsersBlock from './FollowUsersBlock.svelte';
    import GeneralSettingsBlock from './GeneralSettingsBlock.svelte';
    import Heading from './Heading.svelte';
    import SearchBlock from './search/SearchBlock.svelte';
    import SubredditsBlock from './subreddits/SubredditsBlock.svelte';

    const dataPromise = storage.getAllData();
    let destroy: Unsubscriber;

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

    onDestroy(() => void destroy?.());

    const s = sections.settings;
</script>

<div class="w-full">
    {#if $storageData.isLoaded}
        <h1 class="text-2xl uppercase font-bold tracking-widest text-skin-gray mb-4">
            {getMsg('optionsNavSettings')}
        </h1>
        <section>
            <Heading id={s.general.id} name={s.general.name} />
            <GeneralSettingsBlock />
        </section>
        <section>
            <Heading id={s.mail.id} name={getMsg('optionsNavMailFull')} />
            <AccountsBlock />
        </section>
        <section>
            <Heading id={s.subreddit.id} name={s.subreddit.name} />
            <SubredditsBlock />
        </section>
        <section>
            <Heading id={s['reddit-search'].id} name={s['reddit-search'].name} />
            <SearchBlock />
        </section>
        <section>
            <Heading id={s['follow-user'].id} name={s['follow-user'].name} />
            <FollowUsersBlock />
        </section>
        <div class="h-[80vh]" />
    {/if}
</div>

<style lang="postcss">
    section {
        @apply mb-10;
    }
</style>
