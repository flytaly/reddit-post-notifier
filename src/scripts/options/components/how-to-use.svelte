<script>
    import Bell from '../../assets/bell.svg';
    import { routes } from '../route';
</script>

<style>
    article {
        margin-bottom: 1.5rem;
    }
    header {
        font-weight: bold;
        font-size: 1.1rem;
        margin-bottom: 0.6rem;
    }
    .description {
        margin-left: 2rem;
    }
    ul {
        list-style: none;
    }
    li {
        margin-bottom: 0.8rem;
    }
    .query-example {
        margin-top: 0.4rem;
        font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace;
        padding-left: 0.3rem;
        border: 1px solid var(--border-color);
    }
</style>

<div>
    <article>
        <header>Watch for all new posts in a subreddit</header>
        <div class="description">
            If you want to monitor
            <b>every</b>
            post in subreddit go to
            <a href={`#${routes.settings.sections.subreddit.id}`}>subreddits section</a>
            and add the subreddit name to the list. Then open popup and click update button.
        </div>
    </article>
    <article>
        <header>Watch for specific posts</header>
        <div class="description">
            <div>
                You can stay up to date with reddit search by adding query in the "search query" field in the
                <a href={`#${routes.settings.sections['reddit-search'].id}`}>reddit search</a>
                section. Look at
                <a href="https://www.reddit.com/wiki/search#wiki_field_search" target="_blank">reddit search wiki</a>
                to learn supported keywords and
                <a href="https://www.reddit.com/wiki/search#wiki_boolean_operators" target="_blank">
                    boolean operators</a>.
            </div>
            <br />
            <div>
                Search query examples:
                <ul>
                    <li>
                        <div>any posts that contain words France or Germany:</div>
                        <div class="query-example">France OR Germany</div>
                    </li>
                    <li>
                        <div>posts that have Attack on Titan or its japanese name in their title</div>
                        <div class="query-example">title:"attack on titan" OR title:"shingeki no kyojin"</div>
                    </li>
                </ul>
            </div>
            <div>
                Don’t forget to select checkmark with
                <span class="icon">
                    {@html Bell}
                </span>icon to recieve notifications.
            </div>
        </div>
    </article>
</div>
