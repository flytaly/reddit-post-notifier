import getTemplates from './templates';
import getElements from './elements';
import getOptions from './options';
import nav from './navigation';
import { connect, postMessage } from './messages';
import handleKeydownEvent from './handleKeys';
import types from '../types';
import applyTheme from '../theme';
import './openLinks';


async function init() {
    applyTheme();
    getTemplates();
    getOptions();
    const elements = getElements();
    connect(nav);

    elements.headerBackBtn.addEventListener('click', () => nav.navigate(nav.locations.queriesList, { forceUpdate: true }));
    elements.options.addEventListener('click', async () => {
        await browser.runtime.openOptionsPage();
        window.close();
    });
    elements.update.addEventListener('click', () => {
        postMessage({ type: types.UPDATE_NOW });
        elements.update.blur();
    });
    document.addEventListener('keydown', handleKeydownEvent);
}

async function start() {
    await init();
    await nav.navigate(nav.locations.queriesList);
}

document.addEventListener('DOMContentLoaded', start, {
    capture: true,
    passive: true,
    once: true,
});
