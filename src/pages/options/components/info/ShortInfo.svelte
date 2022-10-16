<script lang="ts">
    import { IS_CHROME } from '@/constants';
    import { browser } from 'webextension-polyfill-ts';

    const { version } = browser.runtime.getManifest();

    const addonHref = IS_CHROME
        ? 'https://chrome.google.com/webstore/detail/reddit-post-notifier/hoolgoecmeegpbidbbcefgkjegdejibd/reviews'
        : 'https://addons.mozilla.org/firefox/addon/reddit-post-notifier/reviews/';
</script>

<article class="flex items-center">
    <div>
        <div class="text-lg">
            <b class="text-xl">Reddit Post Notifier </b>
            <span class="ml-1 text-base">{`v. ${version}`}</span>
        </div>
        <div class="text-sm">
            <a href={addonHref} target="_blank" rel="noreferrer">rating</a>
            |
            <a href="https://github.com/flytaly/reddit-post-notifier" target="_blank" rel="noreferrer">github</a>
            |
            <a href="https://github.com/flytaly/reddit-post-notifier/issues" target="_blank" rel="noreferrer">
                create an issue
            </a>
            |
            <a href="https://ko-fi.com/flytaly" target="_blank" rel="noreferrer">ko-fi</a>
        </div>
    </div>
</article>
