import type { PageId } from './lib/routes';
import Options from '@/pages/options/components/OptionsApp.svelte';
import { mount } from 'svelte';

const app = mount(Options, {
    target: document.getElementById('app')!,
    props: { pageId: 'watch' as PageId },
});

export default app;
