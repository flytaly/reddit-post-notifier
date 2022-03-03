<script lang="ts">
    import { LogoIcon, KoFiIcon } from '@/pages/options/icons';
    import getMsg from '@/utils/get-message';
    import type { PageId } from '../routes';
    import { sections } from '../routes';
    export let current: PageId;
</script>

<aside>
    <a href="./index.html" class="self-center text-skin-text hover:text-skin-text">
        <div class="logo">
            {@html LogoIcon}
        </div>
    </a>
    <nav class="flex flex-col p-4 leading-8">
        <a href="./index.html#settings" class:current={current === 'settings'}>
            {getMsg('optionsNavSettings')}
        </a>
        {#each Object.values(sections.settings) as { id, name }}
            <a href={`./index.html#${id}`} class="ml-4">{name}</a>
        {/each}
        <a href="./import-export.html" class:current={current === 'import-export'}>
            {getMsg('optionsNavImportExport')}
        </a>
        <a href="./info.html" class:current={current === 'info'}>
            {getMsg('optionsNavInfo')}
        </a>
        {#each Object.values(sections.info) as { id, name }}
            <a href={`./info.html#${id}`} class="ml-4">{name}</a>
        {/each}
    </nav>
    <div class="mx-2 text-xs">
        <a
            class="supportme gap-x-2 leading-normal justify-center text-center rounded-md text-skin-text hover:text-skin-accent group"
            href="https://ko-fi.com/flytaly"
            target="_blank"
        >
            <div class="w-5 flex items-center group-hover:animate-pulse p-0">
                {@html KoFiIcon}
            </div>
            <div>Support me</div>
            <div />
            <div class="transition-opacity opacity-0 group-hover:opacity-100 group-focus:opacity-100">on Ko-Fi</div>
        </a>
    </div>
</aside>

<style lang="postcss">
    .supportme {
        display: grid;
        grid-template-columns: min-content max-content;
    }
    aside {
        @apply sticky flex flex-col top-4 pt-2 shadow-sidebar text-sm;
    }
    a {
        @apply text-skin-text;
    }
    .logo {
        @apply w-[4.5rem] mb-1 mx-auto translate-x-[2px];
    }
    .logo :global(.eye) {
        /* ? @apply doesn't work here for some reason */
        fill: var(--color-accent);
    }
    .logo:hover :global(.eye) {
        fill: var(--color-accent2);
    }
    .current {
        @apply text-skin-accent font-bold;
    }
</style>
