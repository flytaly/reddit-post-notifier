<script lang="ts">
    import { TARGET } from '../../../constants';
    import getMsg from '../../../utils/get-message';

    let helloStr = `Hello world! This is ${TARGET}. ${getMsg('name')}`;
</script>

<div class="text-2xl text-blue-500">{helloStr}</div>

<style global lang="postcss">
    @import './Popup.pcss';
    @import '../../../../node_modules/nprogress/nprogress.css';
</style>
