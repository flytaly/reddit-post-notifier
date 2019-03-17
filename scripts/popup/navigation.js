import getElements from './elements';
import renderQueryListBlock from './renderQueryList';
import renderPostListBlock from './renderPostList';
import updateHeader from './updateHeader';
import updateFooter from './updateFooter';
import { updateData, getData } from './data';
import getOptions from './options';

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
                        href: `https://reddit.com/r/${id}/new`,
                    });
                    updateFooter(nav, {
                        subreddit: id,
                    });
                }
                if (type === 's') {
                    info.search = id;
                    const { name, query, subreddit } = data.watchQueries.find(q => q.id === id);

                    const endpoint = subreddit
                        ? `/r/${subreddit}/search?sort=new&restrict_sr=on&q=${query}`
                        : `/search?q=${query}&sort=new`;

                    updateHeader(location, {
                        name: name || query,
                        href: `https://reddit.com${endpoint}`,
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
