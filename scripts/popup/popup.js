import getTemplates from './templates';
import getElements from './elements';
import getOptions from './options';
import nav from './navigation';
import { connect } from './messages';
import handleKeydownEvent from './handleKeys';

async function init() {
    getTemplates();
    getOptions();
    const elements = getElements();
    connect(nav);

    elements.headerBackBtn.addEventListener('click', () => nav.navigate(nav.locations.queriesList, { forceUpdate: true }));
    elements.options.addEventListener('click', async () => {
        await browser.runtime.openOptionsPage();
        window.close();
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
