import Options from '@options/components/OptionsApp.svelte';
import type { PageId } from './lib/routes';

const app = new Options({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    target: document.getElementById('app')!,
    props: { pageId: 'settings' as PageId },
});

export default app;
