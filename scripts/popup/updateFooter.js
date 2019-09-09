import getElements from './elements';
import storage from '../storage';

async function updateFooter(nav, payload) {
    const { footerBtn, mainContainer } = getElements();

    if (nav.locations.current === nav.locations.queriesList) {
        footerBtn.onclick = async () => {
            await storage.removeAllPosts();
            nav.navigate(nav.locations.queriesList, { forceUpdate: true });
        };
    }

    if (nav.locations.current === nav.locations.postList) {
        footerBtn.onclick = async () => {
            await storage.removePostsFrom(payload);
            const rows = mainContainer.querySelectorAll('ul.post-list li');
            rows.forEach((row) => row.classList.add('read'));
        };
    }
}

export default updateFooter;
