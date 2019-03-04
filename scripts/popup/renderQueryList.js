import getTemplates from './templates';
import getOptions from './options';
import { getData } from './data';

function renderQueryListRow(queryListRowTmp, { queryName, newPosts }) {
    const queryListRow = queryListRowTmp.querySelector('li');
    const queryNameElem = queryListRowTmp.querySelector('.query-name');
    queryListRow.dataset.id = `r_${queryName}`;
    queryNameElem.textContent = `${queryName} (${newPosts})`;

    return queryListRow;
}

async function renderQueryListBlock(nav) {
    const templates = getTemplates();
    const { subrData } = await getData();
    const { watchSubreddits } = await getOptions();

    const queryListTmp = templates.queryList.cloneNode(true);
    const queryList = queryListTmp.querySelector('ul');

    queryList.addEventListener('click', ({ target }) => {
        if (target.classList.contains('check-mark')) return;
        const { id } = target.parentElement.dataset;
        if (id) {
            nav.navigate(nav.locations.postList, {
                id: id.slice(2),
                type: id.slice(0, 1),
            });
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
