<script lang='ts'>
    import browser from 'webextension-polyfill';
    import { GithubIcon, HeartIcon, StarIcon } from '@options/lib/icons';
    import { routes } from '@options/lib/routes';
    import { IS_CHROME } from '@/constants';

    const { version } = browser.runtime.getManifest();

    const addonHref = IS_CHROME
        ? 'https://chrome.google.com/webstore/detail/reddit-post-notifier/hoolgoecmeegpbidbbcefgkjegdejibd/reviews'
        : 'https://addons.mozilla.org/firefox/addon/reddit-post-notifier/reviews/';
</script>

<article class='flex items-center'>
    <div>
        <div>
            <b class='text-xl'>Reddit Post Notifier </b>
            <span class='ml-1 text-base'>{`v. ${version}`}</span>
        </div>
        <div class='flex gap-1 text-sm'>
            <a href={addonHref} class='group inline-flex items-center' target='_blank' rel='noreferrer'>
                <span class='mr-1 h-4 w-4 text-skin-text group-hover:text-skin-accent'>{@html StarIcon}</span>
                <span>rating</span>
            </a>
            <span>|</span>
            <a
                href='https://github.com/flytaly/reddit-post-notifier'
                target='_blank'
                rel='noreferrer'
                class='group inline-flex items-center'
            >
                <span class='mr-1 h-4 w-4 text-skin-text group-hover:text-skin-accent'>{@html GithubIcon}</span>
                <span>github</span>
            </a>
            <span>|</span>
            <a href={routes.donate.href} class='group group inline-flex items-center'>
                <span class='mr-1 h-4 w-4 text-rose-200 group-hover:text-rose-500'>{@html HeartIcon}</span>
                <span>support development</span>
            </a>
        </div>
    </div>
</article>
