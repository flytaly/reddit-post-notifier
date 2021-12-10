<script lang="ts">
    import { LogoIcon } from '@/views/options/icons';
    import type { PageId } from '../routes';
    import { sections } from '../routes';

    export let current: PageId;

    const navItems: Array<{ key: string; name: string; level: 1 | 2 }> = [];

    Object.entries(sections).forEach(([key, b]) => {
        const [, l2] = key.split('__');
        navItems.push({ key, level: l2 ? 2 : 1, name: b.name });
    });
</script>

<aside>
    <a href="#settings" class="self-center text-skin-base hover:text-skin-base">
        <div class="logo">
            {@html LogoIcon}
        </div>
    </a>
    <nav class="flex flex-col">
        {#each navItems as { key, name, level } (key)}
            <a href={key} class="leading-8 text-skin-base" class:current={current === key} class:level2={level === 2}
                >{name}</a
            >
        {/each}
    </nav>
</aside>

<style lang="postcss">
    aside {
        @apply sticky flex flex-col top-4 p-4 pt-2 pb-8 shadow-sidebar text-sm;
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
