/* eslint-disable no-param-reassign */
import getTemplates from './templates';
import getElements from './elements';
import storage from '../storage';
import { getData } from './data';

const baseUrl = 'https://reddit.com';

function getPostImage(post) {
    const image = post.data.preview && post.data.preview.images && post.data.preview.images[0];
    if (!image || !image.resolutions) return null;
    const { url } = image.resolutions[1];
    if (!url) return null;
    const img = document.createElement('img');
    img.src = url;

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

export function insertNewPosts({ posts, subreddit }) {
    const { postListRow } = getTemplates();
    const list = document.querySelector('.post-list');

    if (!list || list.dataset.subreddit !== subreddit) return;

    const postFragment = posts.reduce((fragment, post) => {
        fragment.appendChild(renderPostListRow(
            postListRow.cloneNode(true),
            post.data,
        ));
        return fragment;
    }, document.createDocumentFragment());
    list.insertBefore(postFragment, list.firstChild);
}

async function renderPostListBlock({ subreddit }) {
    const templates = getTemplates();
    const data = await getData();
    const posts = subreddit && data.subrData[subreddit].posts;
    const postListTmp = templates.postList.cloneNode(true);
    const postList = postListTmp.querySelector('ul');
    const { preview } = getElements();
    let windowHeight;
    postList.dataset.subreddit = subreddit;

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
        const li = target.parentNode;
        const { id } = li.dataset;
        await storage.removePost({ id, subreddit });
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
        while (target !== postList) {
            // eslint-disable-next-line prefer-destructuring
            id = target.dataset.id;
            if (id) break;
            target = target.parentNode;
        }
        if (!id) return;
        if (id === previousPostId) return;
        previousPostId = id;
        windowHeight = document.documentElement.clientHeight;
        // eslint-disable-next-line no-shadow
        const posts = subreddit && (await getData()).subrData[subreddit].posts;
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
