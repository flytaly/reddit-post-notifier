<script>
    import PostList from './post-list.svelte';
    import SvgButton from './svg-button.svelte';
    import { getMsg } from '../../utils';
    import ArrowRight from '../assets/arrowhead-up.svg';
    import OpenInNew from '../assets/open-in-new.svg';
    import ListRow from './list-row.svelte';

    export let clickHandler = null;
    export let checkMarkClickHandler = null;
    export let text = '';
    export let isExpanded = false;
    export let href = '#';
    export let subredditOrSearchId;
    export let type = 'subreddit';

    const linkClickHandler = (e) => {
        e.stopPropagation();
        browser.tabs.create({ url: href, active: true });
    };
</script>

<style>
    .item-name {
        display: flex;
        align-items: center;
        flex-grow: 1;
        padding: 4px 2px;
    }
    .item-name .text {
        margin-right: 1em;
    }
    .item-name :global(svg path) {
        fill: var(--link-color);
        fill-opacity: 0.5;
    }
    .item-name :global(a:hover svg path) {
        fill-opacity: 1;
    }
    .arrow :global(svg) {
        transition: transform 200ms ease-out;
    }
    .isExpanded :global(svg) {
        transform: rotate(180deg);
    }

    .post-list-container {
        display: flex;
        flex-direction: row;
    }

    .line {
        display: flex;
        padding: 0;
        background: none;
        box-shadow: none;
        border: 0;
        width: 2em;
        justify-content: center;
        outline: none;
    }
    .line span {
        width: 1px;
        height: 100%;
        background-color: var(--collapse-line-color);
    }
    .line:hover span,
    .line:focus span {
        width: 2px;
        background-color: var(--collapse-line-hovered-color);
    }
</style>

<ListRow {checkMarkClickHandler} title={getMsg('queryListCheckMark_title')} on:click>
    <div class="item-name">
        <span class="text">{text}</span>
        <SvgButton {href} on:click={linkClickHandler} title={getMsg('watchListOpenInNew_title')}>
            {@html OpenInNew}
        </SvgButton>
    </div>

    <SvgButton on:click={clickHandler}>
        <span class="arrow" class:isExpanded>
            {@html ArrowRight}
        </span>
    </SvgButton>
</ListRow>
{#if isExpanded}
    <li class="post-list-container" data-keys-target="list-container">
        <button class="line" on:click><span /></button>
        <PostList {subredditOrSearchId} {type} />
    </li>
{/if}
