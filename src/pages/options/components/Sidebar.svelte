<script lang="ts">
    import { BackupIcon, HeartIcon, LogoIcon, WatchListIcon, SettingsIcon, HelpCircleIcon } from '@options/lib/icons';
    import type { PageId } from '@options/lib/routes';
    import { routes } from '@options/lib/routes';

    export let current: PageId;

    const pageIcons: Record<PageId, string> = {
        watch: WatchListIcon,
        'import-export': BackupIcon,
        settings: SettingsIcon,
        info: HelpCircleIcon,
        donate: HeartIcon,
    };
</script>

<aside class="sticky top-4 mt-4 flex flex-col text-sm">
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
                <a href={`${href}#${id}`} class="ml-8">{name}</a>
            {/each}
        {/each}
    </nav>
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
