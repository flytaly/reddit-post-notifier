<script lang="ts">
    import { LogoIcon, KoFiIcon } from '@/pages/options/icons';
    import getMsg from '@/utils/get-message';
    import type { PageId } from '../routes';
    import { sections } from '../routes';

    export let current: PageId;

    const navItems: Array<{ key: string; name: string; level: 1 | 2 }> = [
        { name: getMsg('optionsNavSettings'), key: './index.html#settings', level: 1 },
    ];
    Object.entries(sections.settings).forEach(([key, b]) => {
        navItems.push({ key: `./index.html#${key}`, level: 2, name: b.name });
    });

    navItems.push({ name: getMsg('optionsNavInfo'), key: './info.html#', level: 1 });
    Object.entries(sections.info).forEach(([key, b]) => {
        navItems.push({ key: `./info.html#${key}`, level: 2, name: b.name });
    });
</script>

<aside>
    <a href="./index.html" class="self-center text-skin-text hover:text-skin-text">
        <div class="logo">
            {@html LogoIcon}
        </div>
    </a>
    <nav class="flex flex-col p-4">
        {#each navItems as { key, name, level } (key)}
            <a href={key} class="leading-8 text-skin-text" class:current={current === key} class:level2={level === 2}>
                {name}
            </a>
        {/each}
    </nav>
    <div class="mx-2 text-xs">
        <a
            class="supportme gap-x-2 justify-center text-center rounded-md text-skin-text hover:text-skin-accent group"
            href="https://ko-fi.com/flytaly"
            target="_blank"
        >
            <div class="w-5 flex items-center group-hover:animate-pulse">
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
    .level2 {
        @apply ml-4;
    }
</style>
