<script lang='ts'>
    import ReddixLogo from '@assets/reddix-logo.svg?raw';
    import storage from '@/storage';
    import type { StorageFields } from '@/storage/storage-types';
    import { IS_CHROME } from '@/constants';

    let isShown = false;
    const reddixHref = IS_CHROME
        ? 'https://chromewebstore.google.com/detail/reddix-reddit-bookmarks/mbedpjfdcabldemjmbkngheehfaelohe'
        : 'https://addons.mozilla.org/firefox/addon/reddix-reddit-bookmarks/';

    storage.getLocal({ showReddixPromo: true } as Pick<StorageFields, 'showReddixPromo'>).then(({ showReddixPromo }) => {
        isShown = showReddixPromo;
    });

    function hidePromo() {
        isShown = false;
        storage.setLocal({ showReddixPromo: false } as Pick<StorageFields, 'showReddixPromo'>);
    }
</script>

{#if isShown}
    <div class='ring-1 hover:ring-2 px-2 py-1 ring-skin-delimiter rounded text-skin-text'>
        <div class='flex gap-2'>
            <div class='w-6 h-6 text-orange-700'>
                <a class='w-6 h-6 text-orange-700' href={reddixHref} target='_blank'>
                    {@html ReddixLogo}
                </a>
            </div>
            <div>
                <p class='flex justify-between gap-2'>
                    <span>
                        Check out <a href={reddixHref} class='font-bold text-sm' target='_blank'>Reddix</a> extension
                    </span>
                    <button on:click={hidePromo} title='close' class='font-mono text-base font-bold hover:text-skin-accent'>⨯</button>
                </p>
                <p class='text-xs text-skin-gray'>
                    to search in your Reddit saved items
                </p>
            </div>
        </div>
    </div>
{/if}
