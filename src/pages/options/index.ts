import Options from '@options/components/OptionsApp.svelte';
import type { PageId } from './lib/routes';

const app = new Options({
    target: document.getElementById('app')!,
    props: { pageId: 'settings' as PageId },
});

export default app;
