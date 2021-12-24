<script lang="ts">
    import storage from '@/storage/storage';
    import { onDestroy, onMount, tick } from 'svelte';
    import type { Unsubscriber } from 'svelte/store';
    import { pageInfo, sections } from '../routes';
    import { storageData } from '../store';
    import AccountsBlock from './AccountsBlock.svelte';
    import FollowUsersBlock from './FollowUsersBlock.svelte';
    import GeneralSettingsBlock from './GeneralSettingsBlock.svelte';
    import Heading from './Heading.svelte';
    import SearchBlock from './search/SearchBlock.svelte';
    import SubredditsBlock from './subreddits/SubredditsBlock.svelte';

    let destroy: Unsubscriber;
    const dataPromise = storage.getAllData();

    onMount(() => {
        // wait for children sections to mount and then scroll based on hash
        void (async () => {
            await dataPromise;
            await tick();
            destroy = pageInfo.subscribe(({ sectionId }) => {
                if (sectionId !== '#settings') {
                    document.body.querySelector(sectionId)?.scrollIntoView();
                } else window.scrollTo(0, 0);
            });
        })();
    });
    onDestroy(() => void destroy?.());
</script>

<div class="w-full">
    {#if $storageData.isLoaded}
        <h1 class="text-2xl uppercase font-bold tracking-widest text-skin-gray mb-4">
            {sections['#settings'].name}
        </h1>

        <section>
            <Heading id={'#settings__general'} />
            <GeneralSettingsBlock />
        </section>

        <section>
            <Heading id={'#settings__mail'} />
            <AccountsBlock />
        </section>
        <section>
            <Heading id={'#settings__subreddit'} />
            <SubredditsBlock />
        </section>
        <section>
            <Heading id={'#settings__reddit-search'} />
            <SearchBlock />
        </section>
        <section>
            <Heading id="#settings__follow-user" />
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
