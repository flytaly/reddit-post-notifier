/* eslint-disable prefer-destructuring, no-param-reassign */

import getTemplates from './templates';
import getElements from './elements';
import storage from '../storage';
import { getData } from './data';

const baseUrl = 'https://reddit.com';

function getPostImage(post) {
    const image = post.data.preview && post.data.preview.images && post.data.preview.images[0];
    if (!image || !image.resolutions || !image.resolutions.length) return null;
    const { url, width, height } = image.resolutions[1] || image.resolutions[0];
    if (!url) return null;
    const img = document.createElement('img');
    img.src = url;
    img.height = height;
    img.width = width;

    return img;
}

function fillPreview(preview, post) {
    preview.innerHTML = '';
    preview.classList.add('show');
    if (!post) return false;
    const { selftext, url } = post.data;
    if (selftext) {
        preview.textContent = `${selftext.slice(0, 400)}...`;
        return true;
    }
    const img = getPostImage(post);
    if (img) {
        preview.appendChild(img);
    } else {
        preview.textContent = url || '';
    }
    return true;
}

function renderPostListRow(postListRowTmp, post) {
    const postListRow = postListRowTmp.querySelector('li');
    const rowLink = postListRow.querySelector('a');
    rowLink.textContent = post.title;
    rowLink.href = `${baseUrl}${post.permalink}`;
    postListRow.dataset.id = post.id;
    return postListRow;
}

export function insertNewPosts({ posts = [], subreddit = null, search = null }) {
    const { postListRow } = getTemplates();
    const list = document.querySelector('.post-list');

    if (!list || (!list.dataset.subreddit && !list.dataset.search)) return;
    if (list.dataset.subreddit && list.dataset.subreddit !== subreddit) return;
    if (list.dataset.search && list.dataset.search !== search) return;

    const postFragment = posts.reduce((fragment, post) => {
        fragment.appendChild(renderPostListRow(
            postListRow.cloneNode(true),
            post.data,
        ));
        return fragment;
    }, document.createDocumentFragment());
    list.insertBefore(postFragment, list.firstChild);
}

async function renderPostListBlock({ subreddit, search }) {
    const templates = getTemplates();
    const data = await getData();
    const postListTmp = templates.postList.cloneNode(true);
    const postList = postListTmp.querySelector('ul');
    const { preview } = getElements();
    let windowHeight;
    let posts;
    if (subreddit) {
        posts = data.subrData[subreddit].posts;
        postList.dataset.subreddit = subreddit;
    }
    if (search) {
        posts = data.queryData[search].posts;
        postList.dataset.search = search;
    }

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

    postList.onclick = async ({ target }) => {
        // if (target.classList.contains('check-mark')) {
        const li = target.closest('li');
        const { id } = li.dataset;
        await storage.removePost({ id, subreddit, searchId: search });
        li.classList.add('read');
    };

    const positionPreview = (e) => {
        const { pageX, pageY, clientY } = e;
        preview.style.left = `${pageX + 10}px`;
        const { height } = preview.getBoundingClientRect();
        const offset = windowHeight - clientY - height - 10;
        if (offset < 0) {
            preview.style.top = `${pageY + offset}px`;
        } else {
            preview.style.top = `${pageY + 10}px`;
        }
    };

    let previousPostId;
    postList.onmouseover = async (event) => {
        let { target } = event;
        let id;
        // eslint-disable-next-line no-shadow
        let posts;

        while (target !== postList) {
            id = target.dataset.id;
            if (id) break;
            target = target.parentNode;
        }
        if (!id) return;
        if (id === previousPostId) return;
        previousPostId = id;
        windowHeight = document.documentElement.clientHeight;

        if (subreddit) { posts = (await getData()).subrData[subreddit].posts; }
        if (search) { posts = (await getData()).queryData[search].posts; }

        if (!posts) return;
        const post = posts.find(p => p.data.id === id);
        if (fillPreview(preview, post)) positionPreview(event);
        postList.onmousemove = positionPreview;
    };

    postList.onmouseleave = () => {
        preview.classList.remove('show');
        postList.onmousemove = null;
        previousPostId = null;
    };

    return postList;
}

export default renderPostListBlock;
