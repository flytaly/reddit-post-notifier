<script>
    import SvgButton from './svg-button.svelte';
    import { getMsg } from '../../utils';
    import CheckMark from '../assets/check-mark.svg';
    import ArrowRight from '../assets/arrowhead-right.svg';

    let subredditList;

    export let subreddits = {};
    $: subredditList = Object.keys(subreddits);
</script>

<style>
    main {
        flex: 1 1;
    }

    ul {
        display: flex;
        flex-direction: column;
        list-style: none;
        padding: 0;
        margin: 0;
    }

    ul > li {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 0 4px;
        border-top: 1px solid var(--main-bg-color);
        border-bottom: 1px solid var(--main-bg-color);
    }

    ul > li:focus,
    ul > li:hover {
        background-color: var(--hover-bg-color);
        border-top: 1px solid var(--hover-border-color);
        border-bottom: 1px solid var(--hover-border-color);
        outline: none;
    }
    .check-mark :global(svg) {
        fill: var(--grey);
    }
    li:focus .check-mark :global(svg),
    .check-mark:focus :global(svg),
    .check-mark:hover :global(svg) {
        fill: var(--green);
        transform: scale(1.08);
    }

    .item-name {
        flex-grow: 1;
        padding: 4px 2px;
    }
</style>

<main>
    <ul>
        {#each subredditList as subreddit}
            <li tabindex="1">
                <span class="check-mark">
                    <SvgButton
                        on:click={() => {
                            // remove posts in the subreddit
                        }}
                        title={getMsg('postListCheckMark_title')}>
                        {@html CheckMark}
                    </SvgButton>
                </span>
                <div class="item-name">{subreddit}</div>
                <SvgButton
                    on:click={() => {
                        // move to posts page
                    }}>
                    {@html ArrowRight}
                </SvgButton>
            </li>
        {/each}
    </ul>
</main>
