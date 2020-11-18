import Page from './components/index.svelte';
import storage from '../storage';
import applyTheme from '../theme';

applyTheme();
storage
    .getOptions()
    .then((options) => {
        const page = new Page({ target: document.body, props: { options } });
        return page;
    })
    .catch((e) => console.error(e));
