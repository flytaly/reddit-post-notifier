import getElements from './elements';

async function updateHeader(location, payload) {
    const elements = getElements();

    if (location === 'queriesList') {
        elements.header.classList.remove('posts', 'run-animation');
        elements.headerBackBtn.setAttribute('hidden', true);
        elements.headerSubredditLink.setAttribute('hidden', true);
    }

    if (location === 'postList') {
        const { name, href } = payload;
        elements.header.classList.add('posts', 'run-animation');
        elements.headerBackBtn.removeAttribute('hidden');
        elements.headerSubredditLink.removeAttribute('hidden');
        elements.headerSubredditLink.textContent = name;
        elements.headerSubredditLink.href = href;
    }
}

export default updateHeader;
