import getTemplates from './templates';
import { getData } from './data';


function renderPostListRow(postListRowTmp, post) {
    const postListRow = postListRowTmp.querySelector('li');

    postListRow.textContent = post.title;

    return postListRow;
}

async function renderPostListBlock(id, type) {
    const templates = getTemplates();
    const data = await getData();
    const postListTmp = templates.postList.cloneNode(true);
    const postList = postListTmp.querySelector('ul');

    if (type === 'r') {
        const { posts } = data.subrData[id];
        if (posts && posts.length) {
            const postFragment = posts.reduce((fragment, post) => {
                fragment.appendChild(renderPostListRow(
                    templates.postListRow.cloneNode(true),
                    post.data,
                ));
                return fragment;
            }, document.createDocumentFragment());
            console.log(postFragment);

            postList.appendChild(postFragment);
        }
    }
    postList.classList.add('run-animation');
    return postList;
}

export default renderPostListBlock;
