<script lang="ts">
    import { tooltip } from '@/pages/options/lib/tooltip';
    import getMsg from '@/utils/get-message';
    import { BackupIcon, HeartIcon, HelpCircleIcon, LogoIcon, SettingsIcon, WatchListIcon } from '@options/lib/icons';
    import type { PageId } from '@options/lib/routes';
    import { routes } from '@options/lib/routes';
    import { rateLimits } from '@options/lib/store';

    export let current: PageId;

    const pageIcons: Record<PageId, string> = {
        watch: WatchListIcon,
        'import-export': BackupIcon,
        settings: SettingsIcon,
        info: HelpCircleIcon,
        donate: HeartIcon,
    };

    function formatTime(ts: number) {
        const d = new Date(ts);
        return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
    }
</script>

<aside class="sticky top-4 flex min-h-[calc(100vh-1rem)] flex-col pt-4 text-sm">
    <a href="./watch.html" class="self-center text-skin-text hover:text-skin-text">
        <div class="logo">
            {@html LogoIcon}
        </div>
    </a>
    <nav class="flex flex-col p-4 leading-8">
        {#each Object.values(routes) as { id, href, name, sections }}
            <a {href} class:current={current === id} class="flex items-center">
                {#if pageIcons[id]}
                    <span class="mr-1 h-5 w-5" class:heart={id === 'donate'}>
                        {@html pageIcons[id]}
                    </span>
                {/if}
                {name}
            </a>
            {#each Object.values(sections) as { id, name }}
                <a href={`${href}#${String(id)}`} class="ml-8">{name}</a>
            {/each}
        {/each}
    </nav>
    <div class="mt-auto w-full text-xs">
        {#if $rateLimits}
            <div class="my-4 grid w-max grid-cols-2 gap-x-4 gap-y-1">
                <span
                    use:tooltip={{ content: getMsg('rateLimitsDescription'), allowHTML: true }}
                    class="col-span-2 mt-4 flex items-center border-b border-skin-delimiter"
                >
                    <b class="font-bold">{getMsg('rateLimits')}</b>
                    <span class="ml-2 inline-flex h-[0.85rem] w-[0.85rem] text-skin-text">
                        {@html HelpCircleIcon}
                    </span>
                </span>
                {#if $rateLimits.used}
                    <div>used</div>
                    <div>{$rateLimits.used}</div>
                {/if}
                {#if $rateLimits.remaining}
                    <div>remaining</div>
                    <div>{$rateLimits.remaining}</div>
                {/if}
                {#if $rateLimits.reset}
                    <div>reset at</div>
                    <div>{formatTime($rateLimits.reset)}</div>
                {/if}
            </div>
        {/if}
    </div>
</aside>

<style lang="postcss">
    a {
        @apply text-skin-text;
    }
    .heart {
        @apply text-rose-300;
    }
    .logo {
        @apply mx-auto mb-1 w-[4.5rem] translate-x-[2px];
    }
    .logo :global(.eye) {
        /* ? @apply doesn't work here for some reason */
        fill: var(--color-accent);
    }
    .logo:hover :global(.eye) {
        fill: var(--color-accent2);
    }
    .current {
        @apply font-bold text-skin-accent;
    }
</style>
