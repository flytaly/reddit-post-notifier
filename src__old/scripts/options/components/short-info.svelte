<script>
    import Logo from '../../assets/logo.svg';

    const { version } = browser.runtime.getManifest();

    const addonHref =
        TARGET === 'chrome'
            ? 'https://chrome.google.com/webstore/detail/reddit-post-notifier/hoolgoecmeegpbidbbcefgkjegdejibd/reviews'
            : 'https://addons.mozilla.org/firefox/addon/reddit-post-notifier/reviews/';
</script>

<style>
    article {
        display: flex;
        align-items: center;
    }
    .logo {
        margin-right: 1rem;
    }
    .logo :global(svg) {
        height: 3rem;
    }
    .logo :global(svg .eye) {
        fill: var(--accent-color);
    }
    .name {
        margin-bottom: 0.2rem;
    }
    .name {
        font-size: 1.2rem;
    }
</style>

<article class="short-info">
    <div class="logo">
        {@html Logo}
    </div>
    <div class="info-content">
        <div class="name"><b>Reddit Post Notifier </b> <span>{`Version: ${version}`}</span></div>
        <div>
            <a href={addonHref} target="_blank">rate the extension</a>
            |
            <a href="https://github.com/flytaly/reddit-post-notifier" target="_blank">github</a>
            |
            <a href="https://github.com/flytaly/reddit-post-notifier/issues" target="_blank">create an issue</a>
        </div>
    </div>
</article>
