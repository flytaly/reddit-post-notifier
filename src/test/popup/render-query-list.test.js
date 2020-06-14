import { getByText } from '@testing-library/dom';
import '@testing-library/jest-dom/extend-expect';
import './mocks/browser.mock';
import storage from './mocks/storage.mock';
import './mocks/document-body.mock';
import nav from './mocks/navigation.mock';
import renderQueryListBlock from '../../scripts/popup/renderQueryList';
import { data, updateData } from '../../scripts/popup/data';
import getOptions from '../../scripts/popup/options';

let list;

describe('renderQueryListBlock', () => {
    test('should render query list block ', async () => {
        list = await renderQueryListBlock(nav);
        expect(list).toMatchSnapshot();
    });

    test('should navigate to the list of subreddit\'s posts after click', async () => {
        const { watchSubreddits } = await getOptions();

        const id = watchSubreddits[0];
        expect(id).not.toBeUndefined();
        const len = data.subrData[id].posts.length;

        const row = getByText(list, `r/${id} (${len})`);
        row.click();
        expect(nav.navigate).toHaveBeenLastCalledWith(nav.locations.postList, { id, type: 'r' });
    });
    test('should navigate to the list of queries\'s posts after click', async () => {
        const { id, name } = data.watchQueries[1];

        const len = data.queryData[id].posts.length;

        const row = getByText(list, `${name} (${len})`);
        row.click();
        expect(nav.navigate).toHaveBeenLastCalledWith(nav.locations.postList, { id, type: 's' });
    });

    test('should call removing posts from the subreddit by clicking on the check mark', async () => {
        const { watchSubreddits } = await getOptions();
        const subreddit = watchSubreddits[0];
        const check = list.querySelector(`[data-id="r_${subreddit}"] button.check-mark`);
        check.click();
        expect(storage.removePostsFrom).toHaveBeenLastCalledWith({ subreddit });
    });

    test('should call removing posts from the search query by clicking on the check mark', async () => {
        const { id } = data.watchQueries[1];
        const check = list.querySelector(`[data-id="s_${id}"] button.check-mark`);
        check.click();
        expect(storage.removePostsFrom).toHaveBeenLastCalledWith({ searchId: id });
    });

    test('should return "No unread posts" block if there are no new posts', async () => {
        storage.getQueriesData.mockImplementationOnce(() => ({}));
        storage.getSubredditData.mockImplementationOnce(() => ({}));
        await updateData();
        const noPosts = await renderQueryListBlock(nav);

        expect(noPosts.classList.contains('no-posts')).toBeTruthy();
        expect(noPosts.textContent).toBe('No unread posts');
    });
});
