import Popup from './components/popup.svelte';
import applyTheme from '../theme';
import './openLinks';

const popup = new Popup({ target: document.body });
applyTheme();

export default popup;
