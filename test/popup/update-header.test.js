import 'jest-dom/extend-expect';
import './mocks/document-body.mock';
import nav from './mocks/navigation.mock';
import getElements from '../../scripts/popup/elements';
import updateHeader from '../../scripts/popup/updateHeader';

const { header, headerSubredditLink, mail } = getElements();

describe('updateHeader', () => {
    test('should update header in the main page', () => {
        updateHeader(nav.locations.queriesList);
        expect(header).not.toHaveClass('posts', 'run-animation');
        expect(header).toHaveClass('query-list');
    });
    test('should update header in the post list page', () => {
        const payload = { name: 'name', href: 'http://url.com' };
        updateHeader(nav.locations.postList, payload);
        expect(header).toHaveClass('posts', 'run-animation');
        expect(header).not.toHaveClass('query-list');
        expect(headerSubredditLink).toHaveTextContent(payload.name);
        expect(headerSubredditLink).toHaveAttribute('href', payload.href);
    });

    test('should show number of unread messages', () => {
        const unreadMsgCount = 10;
        updateHeader(nav.locations.queriesList, { unreadMsgCount });
        expect(mail).toHaveClass('unread');
        expect(mail.querySelector('.unread-number')).toHaveTextContent(unreadMsgCount);
        expect(mail).toHaveAttribute('href', 'https://www.reddit.com/message/unread/');
    });

    test('should not show number of unread messages if there are no messages', () => {
        const unreadMsgCount = 0;
        updateHeader(nav.locations.queriesList, { unreadMsgCount });
        expect(mail).not.toHaveClass('unread');
        expect(mail.querySelector('.unread-number')).toHaveTextContent('');
        expect(mail).toHaveAttribute('href', 'https://www.reddit.com/message/inbox/');
    });
});
