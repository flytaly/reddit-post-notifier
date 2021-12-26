<script lang="ts">
    import { sections } from '../routes';
    import type { SectionKey } from '../routes';

    export let id: SectionKey;
    export let level: 1 | 2 | undefined = 2;

    let name = ''

    $: name = sections[id].fullname || sections[id].name

</script>

{#if level === 1}
    <h1 class="text-2xl uppercase font-bold tracking-widest text-skin-gray mb-8" id={id.slice(1)}>
        {name}
    </h1>
{:else}
    <h2 class="text-xl font-bold border-b border-skin-delimiter text-skin-text mb-4" id={id.slice(1)}>
        {name}
    </h2>
{/if}
