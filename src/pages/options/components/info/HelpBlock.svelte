<script lang='ts'>
    import { BellIcon } from '@options/lib/icons';
    import { routes } from '@options/lib/routes';
    import { storageData } from '@options/lib/store';
    import getMsg from '@/utils/get-message';

    let limit = 10;
    $: limit = $storageData.options.limit || 10;
    const subredditHref = `${routes.settings.href}#${routes.watch.sections.subreddit.id}`;
    const searchHref = `${routes.settings.href}#${routes.watch.sections['reddit-search'].id}`;
</script>

<div class='text-base'>
    <details>
        <summary>Update interval and missing posts</summary>
        <div class='ml-8'>
            The extension's update logic is simple. It just checks the latest {limit || 10} posts in given Subreddits, Reddit
            Searches, or following users. This means that the extension may miss some posts if more than {limit || 10} of
            them were posted during the selected interval. It often happens when you just open the browser after a long time
            or set a big update interval for Subreddits with frequent updates.
        </div>
    </details>

    <details class='mt-6'>
        <summary>Watch for new posts in a subreddit</summary>
        <div class='ml-8'>
            <span>
                If you want to monitor
                <b>every</b>
                post in a Subreddit/Multireddit go to the
                <a href={subredditHref}>Subreddits section</a>
                and add the Subreddit name to the list.</span
            >
            <details class='mt-2' open>
                <summary>Filter Subreddit posts</summary>
                <div>
                    <p>
                        If you add filter rules, they will be applied to every post. The posts that don't match at least
                        one rule will be excluded.
                    </p>
                    <p>To test whether it works correctly, click the "fetch and display the latest posts" button.</p>
                </div>
            </details>
        </div>
    </details>

    <details class='mt-6'>
        <summary>Watch for specific posts with Reddit Search</summary>
        <div class='ml-8'>
            <div>
                You can stay up to date with Reddit Search by adding a query in the "search query" field in the
                <a href={searchHref}>Reddit Search</a>
                section. Look at the
                <a href='https://www.reddit.com/wiki/search#wiki_field_search' target='_blank' rel='noreferrer'>
                    Reddit Search wiki
                </a>
                to learn supported keywords and
                <a href='https://www.reddit.com/wiki/search#wiki_boolean_operators' target='_blank' rel='noreferrer'>
                    boolean operators
                </a>.
            </div>
            <br />
            <div>
                Search query examples:
                <ul class='ml-8'>
                    <li>
                        <div>any posts that contain word France or Germany:</div>
                        <div class='query-example'>France OR Germany</div>
                    </li>
                    <li>
                        <div>posts that have Attack on Titan or its Japanese name in their title</div>
                        <div class='query-example'>title:"attack on titan" OR title:"shingeki no kyojin"</div>
                    </li>
                </ul>
            </div>
            <div>
                To receive notifications don't forget to select the checkbox with
                <span class='icon inline-block h-4 w-4'>
                    {@html BellIcon}
                </span>
                icon.
            </div>
        </div>
    </details>

    <details class='mt-6'>
        <summary>{getMsg('helpFiltersVsSearchTitle')}</summary>
        <div class='ml-6'>
            {@html getMsg('helpFiltersVsSearch')}
        </div>
    </details>
</div>

<style lang='postcss'>
    summary {
        @apply mb-2 text-base font-semibold;
    }

    .query-example {
        @apply mb-2 border border-skin-base pl-2 font-mono;
    }

    .icon :global(svg) {
        max-height: 1rem;
        max-width: 1rem;
    }
</style>
