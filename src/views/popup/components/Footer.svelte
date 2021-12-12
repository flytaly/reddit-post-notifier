<script lang="ts">
    import getMsg from '@/utils/get-message';
    import storage from '@/storage';
</script>

<footer class="text-center text-skin-text">
    <button
        class="w-full p-1 bg-skin-btn hover:bg-skin-btn-hover focus:bg-skin-input-hover active:bg-skin-btn-active border-t border-skin-delimiter"
        on:click={() => storage.removeAllPosts()}
    >
        {getMsg('footerButton')}
    </button>
</footer>
