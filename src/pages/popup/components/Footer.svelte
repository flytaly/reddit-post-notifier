<script lang="ts">
    import getMsg from '@/utils/get-message';
    import storage from '@/storage';
</script>

<footer class="text-center text-skin-text">
    <button
        class="w-full border-t border-skin-delimiter bg-skin-btn p-1 hover:bg-skin-btn-hover focus:bg-skin-input-hover active:bg-skin-btn-active"
        on:click={() => storage.removeAllPosts()}
    >
        {getMsg('footerButton')}
    </button>
</footer>
