<script>
    import { getMsg } from '../../utils';
    import storage from '../../storage';
</script>

<style>
    footer {
        background-color: var(--hover-bg-color);
        border-top: 1px solid var(--hover-border-color);
        display: flex;
        flex-direction: row;
        padding: 0;
    }

    .footer-button {
        flex: 1 1 auto;
        padding: 5px;
        border: none;
        margin: 0;
        text-align: center;
        color: var(--footer-font-color);
        background-color: var(--hover-bg-color);
    }

    .footer-button:focus,
    .footer-button:hover {
        background-color: var(--hover-border-color);
    }

    .footer-button:focus:active,
    .footer-button:hover:active {
        background-color: var(--hover-bg-color2);
    }
</style>

<footer>
    <button class="footer-button" on:click={() => storage.removeAllPosts()}>{getMsg('footerButton')}</button>
</footer>
