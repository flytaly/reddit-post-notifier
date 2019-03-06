import getElements from './elements';
import { postMessage } from './messages';
import types from '../types';

async function updateFooter(location, payload) {
    const { footerBtn } = getElements();

    if (location === 'queriesList') {
        footerBtn.onclick = () => {
            postMessage({ type: types.READ_ALL });
        };
    }

    if (location === 'postList') {
        footerBtn.onclick = () => {
            postMessage({ type: types.READ_POSTS, payload });
        };
    }
}

export default updateFooter;
