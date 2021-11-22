<script lang="ts">
    import { BellIcon } from '@/views/options/icons';
    import { storageData } from '../../store';
    import type { SectionKey } from '../../routes';

    const href = (key: SectionKey) => key;
    let limit = 10;
    $: limit = $storageData.options.limit || 10;
</script>

<div class="text-base">
    <article>
        <header>Update interval and missing posts</header>
        <div class="ml-8">
            The extension is simple, it just checks the latest {limit} posts in given subreddits, Reddit Searches, or following
            users. This means that the extension may miss some posts if more than {limit} of them were posted during the
            selected interval. It often happens when you just open the browser after a long time or set a big update interval
            for subreddits with frequent updates.
        </div>
    </article>

    <article class="mt-6">
        <header>Filters vs Reddit Search and delayed notifications</header>
        <div class="ml-6">
            Reddit Search is Reddit's feature while post filter is an extension's tool. Reddit Search is more versatile
            and generally recommended to use, but it may not work with the most recent posts that become searchable only
            after some time (1-15 minutes). So if you need faster notifications use Filters instead or Reddit Search.
        </div>
    </article>

    <article class="mt-6">
        <header>Watch for new posts in a subreddit</header>
        <div class="ml-8">
            <span>
                If you want to monitor
                <b>every</b>
                post in a subreddit/multireddit go to the
                <a href={href('#settings__subreddit')}>subreddits section</a>
                and add the subreddit name to the list. Then open popup and click the update button.
            </span>
            <article class="mt-2">
                <header>Filter subreddit post</header>
                <div>
                    <span>
                        If you add filter rules they will be applied to every post. The posts that don't match at least
                        one rule will be excluded.
                    </span>
                </div>
            </article>
        </div>
    </article>

    <article class="mt-6">
        <header>Watch for specific posts with Reddit Search</header>
        <div class="ml-8">
            <div>
                You can stay up to date with reddit search by adding a query in the "search query" field in the
                <a href={href('#settings__reddit-search')}>reddit search</a>
                section. Look at the
                <a href="https://www.reddit.com/wiki/search#wiki_field_search" target="_blank">reddit search wiki</a>
                to learn supported keywords and
                <a href="https://www.reddit.com/wiki/search#wiki_boolean_operators" target="_blank">
                    boolean operators</a
                >.
            </div>
            <br />
            <div>
                Search query examples:
                <ul class="ml-8">
                    <li>
                        <div>any posts that contain word France or Germany:</div>
                        <div class="query-example">France OR Germany</div>
                    </li>
                    <li>
                        <div>posts that have Attack on Titan or its Japanese name in their title</div>
                        <div class="query-example">title:"attack on titan" OR title:"shingeki no kyojin"</div>
                    </li>
                </ul>
            </div>
            <div>
                To receive notifications don't forget to select the checkbox with
                <span class="icon inline-block w-4 h-4">
                    {@html BellIcon}
                </span>
                icon.
            </div>
        </div>
    </article>
</div>

<style lang="postcss">
    header {
        @apply font-bold text-base mb-2;
    }

    .query-example {
        @apply mb-2 font-mono pl-2 border border-skin-base;
    }

    .icon :global(svg) {
        max-height: 1rem;
        max-width: 1rem;
    }
</style>
