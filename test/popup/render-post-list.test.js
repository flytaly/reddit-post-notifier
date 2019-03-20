/* eslint-disable prefer-destructuring */
import 'jest-dom/extend-expect';
import './mocks/browser.mock';
import { wait, getByText } from 'dom-testing-library';
import storage from './mocks/storage.mock';
import './mocks/document-body.mock';
import renderPostListBlock, { insertNewPosts } from '../../scripts/popup/renderPostList';
import { getData } from '../../scripts/popup/data';
import getOptions from '../../scripts/popup/options';
import getElements from '../../scripts/popup/elements';

afterEach(() => jest.clearAllMocks());
describe('renderPostListBlock', () => {
    test('should render subreddit\'s posts', async () => {
        const { watchSubreddits } = await getOptions();
        const { subrData } = await getData();
        const subreddit = watchSubreddits[0];
        const list = await renderPostListBlock({ subreddit });
        expect(list.querySelectorAll('li')).toHaveLength(subrData[subreddit].posts.length);
        expect(list).toMatchSnapshot();
    });

    test('should render queries\'s posts', async () => {
        const { queryData, watchQueries } = await getData();
        const q = watchQueries[1];
        const list = await renderPostListBlock({ search: q.id });
        expect(list.querySelectorAll('li')).toHaveLength(queryData[q.id].posts.length);
        expect(list).toMatchSnapshot();
    });
});

describe('render new posts', () => {
    const newPosts = [
        { data: { id: 'newPostId1', title: 'newPostTitle1', permalink: 'newPostPermalink1' } },
        { data: { id: 'newPostId2', title: 'newPostTitle2', permalink: 'newPostPermalink2' } },
    ];
    test('should add new posts in subreddit view', async () => {
        const { mainContainer } = getElements();
        const { watchSubreddits } = await getOptions();
        const subreddit = watchSubreddits[0];
        const list = await renderPostListBlock({ subreddit });
        mainContainer.appendChild(list);
        insertNewPosts({ posts: newPosts, subreddit });
        expect(list).toMatchSnapshot();
    });

    test('should add new posts in search query view', async () => {
        const { mainContainer } = getElements();
        const { queryData, watchQueries } = await getData();
        const q = watchQueries[1];
        const list = await renderPostListBlock({ search: q.id });
        mainContainer.innerHTML = '';
        mainContainer.appendChild(list);
        insertNewPosts({ posts: newPosts, search: q.id });
        expect(list.querySelectorAll('li')).toHaveLength(queryData[q.id].posts.length + newPosts.length);
        expect(list).toMatchSnapshot();
    });
});

describe('mouseEvents', () => {
    let subreddit;
    let posts;

    beforeAll(async () => {
        const { mainContainer } = getElements();
        const { watchSubreddits } = await getOptions();
        const { subrData } = await getData();
        subreddit = watchSubreddits[0];
        posts = subrData[subreddit].posts;
        const list = await renderPostListBlock({ subreddit });
        mainContainer.appendChild(list);
    });

    test('should remove post and mark as read after click on check mark', async () => {
        const { id } = posts[0].data;

        const btn = document.querySelector(`li[data-id="${id}"] .check-mark`);
        btn.click();
        expect(storage.removePost).toHaveBeenCalledWith({ id, subreddit });
        await wait(() => expect(btn.closest('li')).toHaveClass('read'));
    });

    test('should mark as read after click on title', async () => {
        const { title, id } = posts[0].data;
        const link = getByText(document.body, title);
        link.click();
        expect(storage.removePost).toHaveBeenCalledWith({ id, subreddit });
        await wait(() => expect(link.closest('li')).toHaveClass('read'));
    });

    test('should show popup', async () => {
        const { preview } = getElements();
        const { title } = posts[0].data;
        const link = getByText(document.body, title);
        expect(preview).not.toHaveClass('show');
        link.dispatchEvent(new MouseEvent('mouseover', {
            bubbles: true,
        }));
        await wait(() => {
            expect(preview).toHaveClass('show');
            expect(preview).toMatchSnapshot();
        });
    });
});
