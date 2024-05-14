<script lang='ts'>
    import { routes } from '@options/lib/routes';
    import Heading from '../Heading.svelte';
    import HelpBlock from './HelpBlock.svelte';
    import ShortcutsTable from './ShortcutsTable.svelte';

    const s = routes.info.sections;
</script>

<section class='mb-8'>
    <Heading id={s.help.id} name={s.help.name} />
    <HelpBlock />
</section>
<section class='mb-8'>
    <Heading id={s.shortcuts.id} name={s.shortcuts.name} />
    <ShortcutsTable />
</section>
<div class='h-52' />
