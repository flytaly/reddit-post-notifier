<script lang="ts">
    import type { SectionKey } from '../routes';
    import { sections } from '../routes';

    export let current: SectionKey;

    let navItems: Array<{ key: string; name: string; level: 1 | 2 }> = [];

    Object.entries(sections).forEach(([key, b]) => {
        const [, l2] = key.split('__');
        navItems.push({ key, level: l2 ? 2 : 1, name: b.name });
    });
</script>

<aside class="sticky top-4 m-4">
    <nav class="flex flex-col">
        {#each navItems as { key, name, level } (key)}
            <a href={key} class="my-1" class:current={current === key} class:level2={level === 2}>{name}</a>
        {/each}
    </nav>
</aside>

<style lang="postcss">
    .current {
        @apply font-bold;
    }
    .level2 {
        @apply ml-4;
    }
</style>
