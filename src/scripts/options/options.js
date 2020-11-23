import Page from './components/index.svelte';
import applyTheme from '../theme';

applyTheme();
// eslint-disable-next-line no-new
new Page({ target: document.body });
