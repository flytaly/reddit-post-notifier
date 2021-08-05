<script lang="ts">
    import Logo from '../../../assets/logo.svg';
    import type { PageId } from '../routes';
    import { sections } from '../routes';

    export let current: PageId;

    let navItems: Array<{ key: string; name: string; level: 1 | 2 }> = [];

    Object.entries(sections).forEach(([key, b]) => {
        const [, l2] = key.split('__');
        navItems.push({ key, level: l2 ? 2 : 1, name: b.name });
    });
</script>

<aside>
    <a href="#info" class="self-center">
        <div class="logo">
            {@html Logo}
        </div>
        <div class="font-bold text-center mb-3">Reddit Post <br /> Notifier</div>
    </a>
    <nav class="flex flex-col">
        {#each navItems as { key, name, level } (key)}
            <a
                href={key}
                class="hover:text-skin-accent leading-8"
                class:current={current === key}
                class:level2={level === 2}>{name}</a
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
    .current {
        @apply text-skin-accent font-bold;
    }
    .level2 {
        @apply ml-4;
    }
</style>
