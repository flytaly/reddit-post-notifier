import getTemplates from './templates';
import getElements from './elements';
import getOptions from './options';
import nav from './navigation';
import { connect } from './messages';

async function init() {
    getTemplates();
    getOptions();
    const elements = getElements();
    connect();

    elements.headerBackBtn.addEventListener('click', () => nav.navigate(nav.locations.queriesList));
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
