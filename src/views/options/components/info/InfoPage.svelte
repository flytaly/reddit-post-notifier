<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import ShortcutsTable from './ShortcutsTable.svelte';
    import ShortInfo from './ShortInfo.svelte';
    import HowToUse from './HowToUse.svelte';

    import { pageInfo } from '../../routes';
    import type { Unsubscriber } from 'svelte/store';
    import Heading from '../Heading.svelte';

    let destroy: Unsubscriber;
    onMount(() => {
        destroy = pageInfo.subscribe(({ sectionId }) => {
            if (sectionId !== '#info') document.querySelector(sectionId)?.scrollIntoView();
            else window.scrollTo(0, 0);
        });
    });
    onDestroy(() => void destroy());
</script>

<section class="mb-8">
    <Heading id="#info" level={1} />
    <ShortInfo />
</section>
<section class="mb-8">
    <Heading id="#info__how-to-use" />
    <HowToUse />
</section>
<section class="mb-8">
    <Heading id="#info__shortcuts" />
    <ShortcutsTable />
</section>
<div class="h-52" />
