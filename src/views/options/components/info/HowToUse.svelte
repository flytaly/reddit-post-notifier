<script lang="ts">
    import Bell from '../../../../assets/bell.svg';
    import type { SectionKey } from '../../routes';

    const href = (key: SectionKey) => key;
</script>

<div class="text-base">
    <article>
        <header>Watch for all new posts in a subreddit</header>
        <div class="ml-8">
            If you want to monitor
            <b>every</b>
            post in a subreddit go to the
            <a href={href('#settings__subreddit')}>subreddits section</a>
            and add the subreddit name to the list. Then open popup and click the update button.
        </div>
    </article>
    <article class="mt-6">
        <header>Watch for specific posts</header>
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
                    {@html Bell}
                </span>
                icon.
            </div>
        </div>
    </article>
</div>

<style lang="postcss">
    a {
        @apply text-skin-link;
    }

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
