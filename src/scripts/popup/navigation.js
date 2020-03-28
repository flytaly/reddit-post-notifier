import getElements from './elements';
import renderQueryListBlock from './renderQueryList';
import renderPostListBlock from './renderPostList';
import updateHeader from './updateHeader';
import updateFooter from './updateFooter';
import { updateData, getData } from './data';
import getOptions from './options';
import { getSubredditUrl, getSearchQueryUrl } from '../utils';

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
        const { messages } = await getOptions();
        nav.locations.current = location;
        switch (location) {
            case this.locations.queriesList: {
                updateHeader(location, { unreadMsgCount: messages && data.messageData.count });
                updateFooter(nav);

                document.body.style.minHeight = '';
                document.body.style.minWidth = '';

                elements.mainContainer.innerHTML = '';
                elements.preview.classList.remove('show');
                elements.mainContainer.appendChild(
                    await renderQueryListBlock(nav),
                );
                break;
            }
            case this.locations.postList: {
                const { id, type } = params;
                const info = {};
                document.body.style.minHeight = '300px';
                document.body.style.minWidth = '400px';
                if (type === 'r') {
                    info.subreddit = id;
                    updateHeader(location, {
                        name: `r/${id}/new`,
                        href: getSubredditUrl(id),
                    });
                    updateFooter(nav, {
                        subreddit: id,
                    });
                }
                if (type === 's') {
                    info.search = id;
                    const { name, query, subreddit } = data.watchQueries.find((q) => q.id === id);
                    updateHeader(location, {
                        name: name || query,
                        href: getSearchQueryUrl(query, subreddit),
                    });
                    updateFooter(nav, {
                        searchId: id,
                    });
                }
                elements.mainContainer.innerHTML = '';
                elements.mainContainer.appendChild(
                    await renderPostListBlock(info),
                );

                break;
            }
            default:
        }
    },
};

export default nav;
