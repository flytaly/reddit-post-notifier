<script lang="ts">
    import { browser } from 'webextension-polyfill-ts';
    import { LogoIcon } from '@/views/options/icons';
    import { IS_CHROME } from '@/constants';

    const { version } = browser.runtime.getManifest();

    const addonHref = IS_CHROME
        ? 'https://chrome.google.com/webstore/detail/reddit-post-notifier/hoolgoecmeegpbidbbcefgkjegdejibd/reviews'
        : 'https://addons.mozilla.org/firefox/addon/reddit-post-notifier/reviews/';
</script>

<article class="flex items-center">
    <div class="logo">
        {@html LogoIcon}
    </div>
    <div>
        <div class="text-lg"><b>Reddit Post Notifier </b> <span>{`Version: ${version}`}</span></div>
        <div class="text-base">
            <a class="text-skin-link" href={addonHref} target="_blank">rate the extension</a>
            |
            <a class="text-skin-link" href="https://github.com/flytaly/reddit-post-notifier" target="_blank">github</a>
            |
            <a class="text-skin-link" href="https://github.com/flytaly/reddit-post-notifier/issues" target="_blank"
                >create an issue</a
            >
        </div>
    </div>
</article>

<style>
    .logo {
        margin-right: 1rem;
    }
    .logo :global(svg) {
        height: 3rem;
    }
    .logo :global(svg .eye) {
        fill: var(--color-accent);
    }
</style>
