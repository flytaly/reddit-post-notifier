<script lang="ts">
    import { TARGET } from '../../../constants';

    let helloStr = `Hello world! This is ${TARGET}`;
</script>

<div class="text-2xl text-blue-500">{helloStr}</div>

<style global lang="postcss">
    @import './Popup.pcss';
    @import '../../../../node_modules/nprogress/nprogress.css';
</style>
