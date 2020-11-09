<script>
    import SvgButton from './svg-button.svelte';
    import { getMsg } from '../../utils';
    import ArrowRight from '../assets/arrowhead-up.svg';
    import ListRow from './list-row.svelte';

    export let clickHandler = null;
    export let checkMarkClickHandler = null;
    export let text = '';
    export let isExpanded = false;
</script>

<style>
    .item-name {
        flex-grow: 1;
        padding: 4px 2px;
    }
    .arrow :global(svg) {
        transition: transform 200ms ease-out;
    }
    .isExpanded :global(svg) {
        transform: rotate(180deg);
    }
</style>

<ListRow {checkMarkClickHandler} title={getMsg('queryListCheckMark_title')} on:click>
    <div class="item-name">{text}</div>
    <SvgButton on:click={clickHandler}>
        <span class="arrow" class:isExpanded>
            {@html ArrowRight}
        </span>
    </SvgButton>
</ListRow>
