import Popup from './popup.svelte';
import applyTheme from '../theme';

const popup = new Popup({ target: document.body });
applyTheme();

export default popup;
