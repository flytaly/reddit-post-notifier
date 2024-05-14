<script lang='ts'>
    import CheckMark from '@assets/check-mark.svg?raw';
    import SvgButton from './SvgButton.svelte';

    export let clickHandler: ((e: MouseEvent) => void) | undefined;
    export let title = '';
    const handler = (e: MouseEvent) => {
        e.stopPropagation();
        clickHandler?.(e);
    };
</script>

<span class='mr-1 text-skin-gray hover:scale-105 hover:text-skin-success' data-keys-target='check-mark'>
    <SvgButton on:click={handler} {title}>
        {@html CheckMark}
    </SvgButton>
</span>
