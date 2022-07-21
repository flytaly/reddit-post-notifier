import Popup from '@/pages/popup/components/Popup.svelte';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const popup = new Popup({ target: document.getElementById('app')! });

export default popup;
