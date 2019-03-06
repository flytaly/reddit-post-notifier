import getElements from './elements';
import renderQueryListBlock from './renderQueryList';
import renderPostListBlock from './renderPostList';
import updateHeader from './updateHeader';
import updateFooter from './updateFooter';
import { updateData, getData } from './data';

const nav = {
    locations: {
        queriesList: 'queriesList',
        postList: 'postList',
        current: 'queriesList',
    },

    async navigate(location, params = {}) {
        const elements = getElements();
        if (params.forceUpdate) await updateData();
        const data = await getData();
        nav.locations.current = location;
        switch (location) {
            case this.locations.queriesList: {
                updateHeader(location);
                updateFooter(nav);
                elements.mainContainer.innerHTML = '';
                elements.mainContainer.appendChild(
                    await renderQueryListBlock(nav),
                );
                break;
            }
            case this.locations.postList: {
                const { id, type } = params;
                const info = {};
                if (type === 'r') {
                    info.posts = data.subrData[id].posts;
                    info.subreddit = id;
                    updateHeader(location, {
                        name: `r/${id}/new`,
                        href: `https://reddit.com/r/${id}/new`,
                    });
                    updateFooter(nav, {
                        subreddit: id,
                    });
                }
                elements.mainContainer.innerHTML = '';
                elements.mainContainer.appendChild(
                    renderPostListBlock(info),
                );

                break;
            }
            default:
        }
    },
};

export default nav;
