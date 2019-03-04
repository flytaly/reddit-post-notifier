import getElements from './elements';
import renderQueryListBlock from './renderQueryList';
import renderPostListBlock from './renderPostList';
import { updateData } from './data';

const nav = {
    locations: {
        queriesList: 'queriesList',
        postList: 'postList',
    },

    async navigate(location, params = {}) {
        const elements = getElements();
        if (params.forceUpdate) await updateData();
        switch (location) {
            case this.locations.queriesList: {
                elements.mainContainer.innerHTML = '';
                elements.mainContainer.appendChild(
                    await renderQueryListBlock(nav),
                );
                break;
            }
            case this.locations.postList: {
                const { id, type } = params;
                elements.mainContainer.innerHTML = '';
                elements.mainContainer.appendChild(
                    await renderPostListBlock(id, type),
                );
                break;
            }
            default:
        }
    },
};

export default nav;
