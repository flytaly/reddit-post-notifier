<script lang="ts">
    import SvgButton from './SvgButton.svelte';
    import CheckMark from '@assets/check-mark.svg';

    export let clickHandler: ((e: MouseEvent) => void) | undefined = undefined;
    export let title = '';
    const handler = (e: MouseEvent) => {
        e.stopPropagation();
        clickHandler?.(e);
    };
</script>

<span class="mr-1 text-skin-gray hover:text-skin-success hover:scale-105" data-keys-target="check-mark">
    <SvgButton on:click={handler} {title}>
        {@html CheckMark}
    </SvgButton>
</span>
