<script lang='ts'>
    import CheckMark from '@assets/check-mark.svg?raw';
    import SvgButton from './SvgButton.svelte';

    interface Props {
        clickHandler: ((e: MouseEvent) => void) | undefined;
        title?: string;
    }

    let { clickHandler, title = '' }: Props = $props();

    const handler = (e: MouseEvent) => {
        e.stopPropagation();
        clickHandler?.(e);
    };
</script>

<span class='mr-1 text-skin-gray hover:scale-105 hover:text-skin-success' data-keys-target='check-mark'>
    <SvgButton onclick={handler} {title}>
        {@html CheckMark}
    </SvgButton>
</span>
