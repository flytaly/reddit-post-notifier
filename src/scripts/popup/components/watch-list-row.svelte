<script>
    import SvgButton from './svg-button.svelte';
    import { getMsg } from '../../utils';
    import ArrowRight from '../assets/arrowhead-right.svg';
    import ListRow from './list-row.svelte';

    export let clickHandler = null;
    export let checkMarkClickHandler = null;
    export let text = '';
</script>

<style>
    .item-name {
        flex-grow: 1;
        padding: 4px 2px;
    }
</style>

<ListRow {checkMarkClickHandler} title={getMsg('queryListCheckMark_title')} on:click>
    <div class="item-name">{text}</div>
    <SvgButton on:click={clickHandler}>
        {@html ArrowRight}
    </SvgButton>
</ListRow>
