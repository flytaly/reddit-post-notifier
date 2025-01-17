import Options from '@options/components/OptionsApp.svelte';
import type { PageId } from './lib/routes';
import { mount } from 'svelte';

const app = mount(Options, {
    target: document.getElementById('app')!,
    props: { pageId: 'settings' as PageId },
});

export default app;
