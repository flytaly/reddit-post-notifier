import { getByText, getAllByTestId, wait } from '@testing-library/dom';
import '@testing-library/jest-dom/extend-expect';
import './mocks/document-body.mock';
import storage from './mocks/storage.mock';
import updateFooter from '../../scripts/popup/updateFooter';
import getElements from '../../scripts/popup/elements';
import nav from './mocks/navigation.mock';

afterEach(() => jest.clearAllMocks());

describe('remove all posts', () => {
    test('should call removing all posts by clicking on the footer button', async () => {
        nav.locations.current = nav.locations.queriesList;
        await updateFooter(nav);
        getByText(document.body, 'Mark all posts as read').click();
        await wait(() => {
            expect(storage.removeAllPosts).toHaveBeenCalledTimes(1);
            expect(nav.navigate).toHaveBeenCalledWith(nav.locations.queriesList, { forceUpdate: true });
        });
    });
});

describe('removing posts from a specific subreddit', () => {
    const { mainContainer } = getElements();

    beforeAll(() => {
        nav.locations.current = nav.locations.postList;
        mainContainer.innerHTML = `<ul class="post-list">
        <li data-testid="row"></li>
        <li data-testid="row"></li>
        <li data-testid="row"></li>
        </ul>`;
    });
    test('should call removing posts from specific subreddit', async () => {
        const payload = { subreddit: 'subreddit' };
        await updateFooter(nav, payload);
        getByText(document.body, 'Mark all posts as read').click();
        expect(storage.removePostsFrom).toHaveBeenCalledWith(payload);
        await wait(() => {
            expect(nav.navigate).not.toHaveBeenCalled();
        });
    });
    test('should mark every post as read', () => {
        const rows = getAllByTestId(document.body, 'row');
        expect(rows).toHaveLength(3);
        rows.forEach((row) => expect(row).toHaveClass('read'));
    });
});
