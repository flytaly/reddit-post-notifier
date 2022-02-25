import Options from '@/pages/options/components/OptionsApp.svelte';
import type { PageId } from './routes';

const app = new Options({
    target: document.getElementById('app'),
    props: { pageId: 'settings' as PageId },
});

export default app;
