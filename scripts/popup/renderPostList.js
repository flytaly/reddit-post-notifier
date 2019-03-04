import getTemplates from './templates';

const baseUrl = 'https://reddit.com';

function renderPostListRow(postListRowTmp, post) {
    const postListRow = postListRowTmp.querySelector('li');
    const rowLink = postListRow.querySelector('a');
    rowLink.textContent = post.title;
    rowLink.href = `${baseUrl}${post.permalink}`;
    return postListRow;
}

function renderPostListBlock(posts) {
    const templates = getTemplates();
    const postListTmp = templates.postList.cloneNode(true);
    const postList = postListTmp.querySelector('ul');

    if (posts && posts.length) {
        const postFragment = posts.reduce((fragment, post) => {
            fragment.appendChild(renderPostListRow(
                templates.postListRow.cloneNode(true),
                post.data,
            ));
            return fragment;
        }, document.createDocumentFragment());

        postList.appendChild(postFragment);
    }
    postList.classList.add('run-animation');
    return postList;
}

export default renderPostListBlock;
