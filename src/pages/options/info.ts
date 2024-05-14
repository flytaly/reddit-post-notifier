import type { PageId } from './lib/routes';
import Options from '@/pages/options/components/OptionsApp.svelte';

const app = new Options({
    target: document.getElementById('app')!,
    props: { pageId: 'info' as PageId },
});

export default app;
