import Popup from './components/popup.svelte';
import applyTheme from '../theme';
import storage from '../storage';
import './open-links';

applyTheme();
storage
    .getOptions()
    .then((options) => {
        const popup = new Popup({ target: document.body, props: { options } });
        return popup;
    })
    .catch((e) => console.error(e));
