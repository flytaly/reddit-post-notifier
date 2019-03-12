import './mocks/document-body.mock';
import './mocks/browser.mock';
import './mocks/storage.mock';
import renderQueryListBlock from './mocks/render-query-list.mock';
import renderPostListBlock from './mocks/render-post-list.mock';
import nav from '../../scripts/popup/navigation';
import updateHeader from '../../scripts/popup/updateHeader';
import updateFooter from '../../scripts/popup/updateFooter';
import getElements from '../../scripts/popup/elements';
import { data } from '../../scripts/popup/data';

jest.mock('../../scripts/popup/updateFooter.js', () => jest.fn());

jest.mock('../../scripts/popup/updateHeader.js', () => jest.fn());

const elements = getElements();

describe('navigation', () => {
    afterEach(() => jest.clearAllMocks());

    test('should navigate to queriesList', async () => {
        await nav.navigate(nav.locations.queriesList, { forceUpdate: true });

        expect(nav.locations.current).toBe(nav.locations.queriesList);
        expect(updateHeader).toHaveBeenCalledWith(nav.locations.queriesList);
        expect(updateFooter).toHaveBeenCalledWith(nav);
        expect(document.body.style.minHeight).toBe('');
        expect(document.body.style.minWidth).toBe('');
        expect(renderQueryListBlock).toHaveBeenCalledTimes(1);
        expect(elements.mainContainer).toMatchSnapshot();
    });

    test('should navigate to the list of subreddit\'s posts', async () => {
        const id = 'subreddit';
        const params = { id, type: 'r' };

        await nav.navigate(nav.locations.postList, params);

        expect(nav.locations.current).toBe(nav.locations.postList);
        expect(document.body.style.minHeight).toBe('300px');
        expect(document.body.style.minWidth).toBe('400px');
        expect(updateHeader).toHaveBeenCalledWith(nav.locations.postList, {
            name: `r/${id}/new`,
            href: `https://reddit.com/r/${id}/new`,
        });
        expect(updateFooter).toHaveBeenCalledWith(nav, {
            subreddit: id,
        });
        expect(renderPostListBlock).toHaveBeenCalledWith({ subreddit: id });
    });

    test('should navigate to the list of the subreddit search queries\'s posts', async () => {
        const { id } = data.watchQueries[0];
        const params = { id, type: 's' };

        await nav.navigate(nav.locations.postList, params);

        expect(nav.locations.current).toBe(nav.locations.postList);
        expect(document.body.style.minHeight).toBe('300px');
        expect(document.body.style.minWidth).toBe('400px');

        expect(updateHeader.mock).toMatchSnapshot();
        expect(updateFooter).toHaveBeenCalledWith(nav, { searchId: id });
        expect(renderPostListBlock).toHaveBeenCalledWith({ search: id });
        expect(elements.mainContainer).toMatchSnapshot();
    });

    test('should navigate to the list of the reddit search queries\'s posts', async () => {
        const { id } = data.watchQueries[0];
        const params = { id, type: 's' };
        jest.spyOn(data.watchQueries, 'find').mockImplementationOnce(() => ({
            name: 'Query name',
            query: 'user_query',
            subreddit: '',
        }));
        await nav.navigate(nav.locations.postList, params);
        expect(updateHeader.mock).toMatchSnapshot();
        expect(updateFooter).toHaveBeenCalledWith(nav, { searchId: id });
        expect(renderPostListBlock).toHaveBeenCalledWith({ search: id });
    });
});
