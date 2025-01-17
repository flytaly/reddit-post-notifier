import Popup from '@/pages/popup/components/Popup.svelte';
import { mount } from 'svelte';

const popup = mount(Popup, { target: document.getElementById('app')! });

export default popup;
