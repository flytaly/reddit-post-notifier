<script>
    import { getMsg } from '../../utils';
    import OpenInNew from '../assets/open-in-new.svg';
    import SvgButton from './svg-button.svelte';
    import CheckMarkButton from './check-mark-button.svelte';

    export let onCheck = null;
    export let href;
    export let title;
    export let disabled = false;

    const linkClickHandler = (e) => {
        e.stopPropagation();
        browser.tabs.create({ url: href, active: true });
    };
</script>

<style>
    .item-name {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 0.3rem 1rem 0.3rem 0.5rem;
    }
    .link {
        margin-left: 0.4rem;
    }
    .link :global(svg path) {
        fill: var(--link-color);
        fill-opacity: 0.5;
    }
    .link :global(a:hover svg path) {
        fill-opacity: 1;
    }
    .disabled {
        color: var(--disable);
        padding-left: 1rem;
    }
</style>

<div class="item-name" class:disabled>
    {#if onCheck}
        <CheckMarkButton clickHandler={onCheck} title={getMsg('queryListCheckMark_title')} />
    {/if}
    <span>{title}</span>
    <span class="link">
        <SvgButton {href} title={getMsg('watchListOpenInNew_title')} on:click={linkClickHandler}>
            {@html OpenInNew}
        </SvgButton>
    </span>
</div>
