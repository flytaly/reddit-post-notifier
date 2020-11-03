<script>
    import SvgButton from './svg-button.svelte';
    import { getMsg } from '../../utils';
    import CheckMark from '../assets/check-mark.svg';
    import ArrowRight from '../assets/arrowhead-right.svg';

    export let clickHandler = null;
    export let checkMarkClickHandler = null;
    export let text = '';
</script>

<style>
    li {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 0 4px;
        border-top: 1px solid var(--main-bg-color);
        border-bottom: 1px solid var(--main-bg-color);
    }

    li:focus,
    li:hover {
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

<li tabindex="0" on:click={clickHandler}>
    <span class="check-mark">
        <SvgButton
            on:click={(e) => {
                e.stopPropagation();
                checkMarkClickHandler(e);
            }}
            title={getMsg('postListCheckMark_title')}>
            {@html CheckMark}
        </SvgButton>
    </span>
    <div class="item-name">{text}</div>
    <SvgButton on:click={clickHandler}>
        {@html ArrowRight}
    </SvgButton>
</li>
