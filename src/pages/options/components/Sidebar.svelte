<script lang="ts">
    import { LogoIcon, KoFiIcon } from '@/pages/options/icons';
    import type { PageId } from '../routes';
    import { routes } from '../routes';
    export let current: PageId;
</script>

<aside>
    <a href="./watch.html" class="self-center text-skin-text hover:text-skin-text">
        <div class="logo">
            {@html LogoIcon}
        </div>
    </a>
    <nav class="flex flex-col p-4 leading-8">
        {#each Object.values(routes) as { id, href, name, sections }}
            <a href={`${href}#${id}`} class:current={current === id}>
                {name}
            </a>
            {#each Object.values(sections) as { id, name }}
                <a href={`${href}#${id}`} class="ml-4">{name}</a>
            {/each}
        {/each}
    </nav>
    <div class="mx-2 text-xs">
        <a
            class="supportme group justify-center gap-x-2 rounded-md text-center leading-normal text-skin-text hover:text-skin-accent"
            href="https://ko-fi.com/flytaly"
            target="_blank"
            rel="noreferrer"
        >
            <div class="flex w-5 items-center p-0 group-hover:animate-pulse">
                {@html KoFiIcon}
            </div>
            <div>Support me</div>
            <div />
            <div class="opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100">on Ko-Fi</div>
        </a>
    </div>
</aside>

<style lang="postcss">
    .supportme {
        display: grid;
        grid-template-columns: min-content max-content;
    }
    aside {
        @apply sticky top-4 flex flex-col pt-2 text-sm shadow-sidebar;
    }
    a {
        @apply text-skin-text;
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
