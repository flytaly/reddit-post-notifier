<script>
    export let big = false;
</script>

<style>
    .container {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-width: 200px;
        max-width: 500px;
    }
    .big {
        min-height: 300px;
        min-width: 400px;
    }
</style>

<div class="container" class:big>
    <slot />
</div>
