<script>
    import Pin from '../../assets/pin.svg';

    export let count = 0;
</script>

<style>
    .container {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 0.3rem 1rem 0.3rem 0.5rem;
    }

    .icon :global(svg) {
        width: 16px;
        height: 16px;
        margin-right: 0.3rem;
    }
</style>

<div class="container">
    <div class="icon">
        {@html Pin}
    </div>
    <span>{`Pinned posts (${count})`}</span>
</div>
