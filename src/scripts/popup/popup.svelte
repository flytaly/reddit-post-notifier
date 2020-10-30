<script>
    import Header from './header.svelte';
    import Footer from './footer.svelte';
    import Main from './main.svelte';
</script>

<style>
    :global(*) {
        box-sizing: border-box;
    }
    :global(body) {
        color: var(--font-color);
        margin: 0;
        min-width: 200px;
        max-width: 500px;
        display: flex;
        flex-direction: column;
        background-color: var(--main-bg-color);
        overflow: hidden auto;
    }
    :global(svg) {
        fill: var(--font-color);
        color: var(--font-color);
    }

    :global(a) {
        text-decoration: none;
        color: var(--link-color);
    }
</style>

<Header />
<Main />
<Footer />
