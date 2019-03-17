import getTemplates from './templates';
import getOptions from './options';
import { getData } from './data';
import storage from '../storage';

function renderQueryListRow(queryListRowTmp, { name, id, postsCount }) {
    const queryListRow = queryListRowTmp.querySelector('li');
    const queryNameElem = queryListRowTmp.querySelector('.query-name');
    queryListRow.dataset.id = id;
    queryNameElem.textContent = `${name} (${postsCount})`;

    return queryListRow;
}

async function renderQueryListBlock(nav) {
    const templates = getTemplates();
    const { subrData, watchQueries, queryData } = await getData();
    const { watchSubreddits = [] } = await getOptions();

    const queryListTmp = templates.queryList.cloneNode(true);
    const noPosts = templates.noPosts.cloneNode(true).querySelector('div');
    const queryList = queryListTmp.querySelector('ul');

    queryList.addEventListener('click', async ({ target }) => {
        const { id: fullId } = target.parentElement.dataset;
        if (fullId) {
            const [type, id] = [fullId.slice(0, 1), fullId.slice(2)];

            if (target.classList.contains('check-mark')) {
                const payload = {};

                if (type === 'r') {
                    payload.subreddit = id;
                    await storage.removePostsFrom(payload);
                }

                if (type === 's') {
                    payload.searchId = id;
                    await storage.removePostsFrom(payload);
                }

                await nav.navigate(nav.locations.queriesList, { forceUpdate: true });
                return;
            }

            nav.navigate(nav.locations.postList, { id, type });
        }
    });

    const rows = [
        ...watchSubreddits.map((sub) => {
            const { posts, lastPostCreated } = subrData[sub] || { posts: [] };
            return {
                lastPostCreated,
                postsCount: posts ? posts.length : 0,
                name: `r/${sub}`,
                id: `r_${sub}`,
            };
        }),
        ...watchQueries.map(({ id, name, query }) => {
            const { posts } = queryData[id] || { posts: [] };
            return {
                postsCount: posts ? posts.length : 0,
                name: name || query,
                id: `s_${id}`,
            };
        }),
    ];

    const rowsWithPosts = rows
        .filter(row => row.postsCount)
        .sort((a, b) => b.lastPostCreated - a.lastPostCreated);

    if (!rowsWithPosts.length) return noPosts;

    const subredditRows = rowsWithPosts.reduce((fragment, rowInfo) => {
        const rowEl = renderQueryListRow(templates.queryListRow.cloneNode(true), rowInfo);
        fragment.appendChild(rowEl);

        return fragment;
    }, document.createDocumentFragment());

    queryList.appendChild(subredditRows);

    return queryList;
}

export default renderQueryListBlock;
