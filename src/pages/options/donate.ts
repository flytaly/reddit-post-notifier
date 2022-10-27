import Options from '@options/components/OptionsApp.svelte';
import type { PageId } from './routes';

const app = new Options({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    target: document.getElementById('app')!,
    props: { pageId: 'donate' as PageId },
});

export default app;
