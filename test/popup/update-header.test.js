import 'jest-dom/extend-expect';
import './mocks/document-body.mock';
import nav from './mocks/navigation.mock';
import getElements from '../../scripts/popup/elements';
import updateHeader from '../../scripts/popup/updateHeader';

const { header, headerBackBtn, headerSubredditLink } = getElements();

describe('updateHeader', () => {
    test('should update header in the post list page', () => {
        const payload = { name: 'name', href: 'http://url.com' };
        updateHeader(nav.locations.postList, payload);
        expect(header).toHaveClass('posts', 'run-animation');
        expect(headerBackBtn).not.toHaveAttribute('hidden');
        expect(headerSubredditLink).not.toHaveAttribute('hidden');
        expect(headerSubredditLink).toHaveTextContent(payload.name);
        expect(headerSubredditLink).toHaveAttribute('href', payload.href);
    });

    test('should update header in the main page', () => {
        updateHeader(nav.locations.queriesList);
        expect(header).not.toHaveClass('posts', 'run-animation');
        expect(headerBackBtn).toHaveAttribute('hidden');
        expect(headerSubredditLink).toHaveAttribute('hidden');
    });
});
