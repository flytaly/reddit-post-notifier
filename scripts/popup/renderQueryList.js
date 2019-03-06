import getTemplates from './templates';
import getOptions from './options';
import { getData } from './data';
import storage from '../storage';

function renderQueryListRow(queryListRowTmp, { queryName, newPosts }) {
    const queryListRow = queryListRowTmp.querySelector('li');
    const queryNameElem = queryListRowTmp.querySelector('.query-name');
    queryListRow.dataset.id = `r_${queryName}`;
    queryNameElem.textContent = `r/${queryName} (${newPosts})`;

    return queryListRow;
}

async function renderQueryListBlock(nav) {
    const templates = getTemplates();
    const { subrData } = await getData();
    const { watchSubreddits } = await getOptions();

    const queryListTmp = templates.queryList.cloneNode(true);
    const queryList = queryListTmp.querySelector('ul');

    queryList.addEventListener('click', async ({ target }) => {
        const { id: fullId } = target.parentElement.dataset;
        if (fullId) {
            const [type, id] = [fullId.slice(0, 1), fullId.slice(2)];

            if (target.classList.contains('check-mark')) {
                const payload = {};

                if (type === 'r') payload.subreddit = id;
                await storage.removePostsFrom(payload);
                nav.navigate(nav.locations.queriesList, { forceUpdate: true });

                return;
            }

            nav.navigate(nav.locations.postList, { id, type });
        }
    });

    const rowsFragment = watchSubreddits.reduce((fragment, subreddit) => {
        if (!subrData[subreddit]) return fragment;

        const { posts } = subrData[subreddit];
        if (posts && posts.length) {
            const row = renderQueryListRow(templates.queryListRow.cloneNode(true), {
                queryName: subreddit,
                newPosts: posts.length,
            });
            fragment.appendChild(row);
        }

        return fragment;
    }, document.createDocumentFragment());

    queryList.appendChild(rowsFragment);

    return queryList;
}

export default renderQueryListBlock;
