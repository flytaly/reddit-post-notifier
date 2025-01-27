<script lang='ts'>
    import { onMount, tick } from 'svelte';

    import storage from '@/storage/storage';
    import getMsg from '@/utils/get-message';
    import Heading from '@options/components/Heading.svelte';
    import { routes } from '@options/lib/routes';
    import { storageData } from '@options/lib/store';
    import AccountsBlock from './AccountsBlock.svelte';
    import FollowUsersBlock from './FollowUsersBlock.svelte';
    import MailBlock from './MailBlock.svelte';
    import SearchBlock from './search/SearchBlock.svelte';
    import SubredditsBlock from './subreddits/SubredditsBlock.svelte';

    const dataPromise = storage.getAllData();

    onMount(() => {
        // wait for children sections to mount and then scroll based on hash
        void (async () => {
            await dataPromise;
            await tick();
            const { hash } = document.location;
            if (hash)
                document.body.querySelector(hash)?.scrollIntoView();
        })();
    });

    const s = routes.watch.sections;
</script>

<div class='w-full'>
    {#if $storageData.isLoaded}
        <h1 class='mb-2 text-xl font-bold uppercase tracking-widest text-skin-gray'>
            {getMsg('optionsNavWatch')}
        </h1>
        <section class="mb-8">
            <Heading id={s.mail.id} name={s.mail.name} />
            <MailBlock />
            <AccountsBlock />
        </section>
        <section class="mb-8">
            <Heading id={s.subreddit.id} name={s.subreddit.name} />
            <SubredditsBlock />
        </section>
        <section class="mb-8">
            <Heading id={s['reddit-search'].id} name={s['reddit-search'].name} />
            <SearchBlock />
        </section>
        <section class="mb-8">
            <Heading id={s['follow-user'].id} name={s['follow-user'].name} />
            <FollowUsersBlock />
        </section>
        <div class='h-[80vh]'></div>
    {/if}
</div>
