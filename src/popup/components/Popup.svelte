<script lang="ts">
    import NProgress from 'nprogress';
    import { onMount } from 'svelte';

    onMount(() => {
        NProgress.start();
    });

    let helloStr = 'Hello world!';
</script>

<div class="">{helloStr}</div>

<style global lang="postcss">
    @import '../../../node_modules/nprogress/nprogress.css';
</style>
