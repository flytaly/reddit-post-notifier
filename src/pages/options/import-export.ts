import Options from '@options/components/OptionsApp.svelte';
import type { PageId } from './lib/routes';

const app = new Options({
    target: document.getElementById('app')!,
    props: { pageId: 'import-export' as PageId },
});

export default app;
