import getTemplates from './templates';
import getElements from './elements';
import getOptions from './options';
import nav from './navigation';

async function init() {
    getTemplates();
    getElements();
    getOptions();
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
