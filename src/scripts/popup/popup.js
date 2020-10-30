import Popup from './components/popup.svelte';
import applyTheme from '../theme';
import './open-links';

const popup = new Popup({ target: document.body });
applyTheme();

export default popup;
