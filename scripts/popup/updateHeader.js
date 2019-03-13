import getElements from './elements';

function updateHeader(location, payload = { unreadMsgCount: 0, name: '', href: '#' }) {
    const elements = getElements();

    if (location === 'queriesList') {
        const { unreadMsgCount } = payload;

        elements.header.classList.remove('posts', 'run-animation');
        elements.header.classList.add('query-list');

        if (unreadMsgCount) {
            elements.mail.classList.add('unread');
            elements.mail.querySelector('.unread-number').textContent = unreadMsgCount;
            elements.mail.href = 'https://www.reddit.com/message/unread/';
        } else {
            elements.mail.classList.remove('unread');
            elements.mail.querySelector('.unread-number').textContent = '';
            elements.mail.href = 'https://www.reddit.com/message/inbox/';
        }
    }

    if (location === 'postList') {
        const { name, href } = payload;
        elements.header.classList.remove('query-list');
        elements.header.classList.add('posts', 'run-animation');
        elements.headerSubredditLink.textContent = name;
        elements.headerSubredditLink.href = href;
    }
}

export default updateHeader;
