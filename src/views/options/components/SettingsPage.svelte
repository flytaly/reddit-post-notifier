<script lang="ts">
    import { onDestroy, onMount, tick } from 'svelte';
    import type { Unsubscriber } from 'svelte/store';
    import storage from '@/storage/storage';
    import { pageInfo } from '../routes';
    import Heading from './Heading.svelte';
    import GeneralSettingsBlock from './GeneralSettingsBlock.svelte';
    import AuthMailBlock from './AuthMailBlock.svelte';
    import SubredditsBlock from './subreddits/SubredditsBlock.svelte';
    import SearchBlock from './SearchBlock.svelte';
    import FollowUsersBlock from './FollowUsersBlock.svelte';

    let destroy: Unsubscriber;
    let dataPromise = storage.getAllData();

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

<div>
    {#await dataPromise then data}
        <Heading id={'#settings'} level={1} />
        <section>
            <Heading id={'#settings__general'} />
            <GeneralSettingsBlock options={data.options} />
        </section>
        <section>
            <Heading id={'#settings__mail'} />
            <AuthMailBlock messages={data.options.messages} messagesNotify={data.options.messagesNotify} />
        </section>
        <section>
            <Heading id={'#settings__subreddit'} />
            <SubredditsBlock subredditsData={data.subreddits} />
        </section>
        <section>
            <Heading id={'#settings__reddit-search'} />
            <SearchBlock queriesData={data.queries} queriesList={data.queriesList} />
        </section>
        <section>
            <Heading id="#settings__follow-user" />
            <FollowUsersBlock options={data.options} usersList={data.usersList} />
        </section>
        <div class="h-52" />
    {/await}
</div>

<style lang="postcss">
    section {
        @apply mb-10;
    }
</style>
