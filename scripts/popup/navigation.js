import getElements from './elements';
import renderQueryListBlock from './renderQueryList';
import renderPostListBlock from './renderPostList';
import updateHeader from './updateHeader';
import { updateData, getData } from './data';

const nav = {
    locations: {
        queriesList: 'queriesList',
        postList: 'postList',
    },

    async navigate(location, params = {}) {
        const elements = getElements();
        if (params.forceUpdate) await updateData();
        const data = await getData();
        switch (location) {
            case this.locations.queriesList: {
                updateHeader(location);
                elements.mainContainer.innerHTML = '';
                elements.mainContainer.appendChild(
                    await renderQueryListBlock(nav),
                );
                break;
            }
            case this.locations.postList: {
                const { id, type } = params;
                let posts = [];
                if (type === 'r') {
                    // eslint-disable-next-line prefer-destructuring
                    posts = data.subrData[id].posts;
                    updateHeader(location, {
                        name: `r/${id}`,
                        href: `https://reddit.com/r/${id}`,
                    });
                }
                elements.mainContainer.innerHTML = '';
                elements.mainContainer.appendChild(
                    renderPostListBlock(posts),
                );

                break;
            }
            default:
        }
    },
};

export default nav;
