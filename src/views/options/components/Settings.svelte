<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import type { Unsubscriber } from 'svelte/store';
    import { pageInfo } from '../routes';

    let destroy: Unsubscriber;

    onMount(() => {
        destroy = pageInfo.subscribe((value) => {
            document.querySelector(value.sectionId)?.scrollIntoView();
        });
    });
    onDestroy(() => void destroy());
</script>

<div>
    <h1>Settings</h1>
</div>
