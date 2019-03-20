import storage from '../storage';

export const notificationIds = {
    mail: 'mail',
    subreddit: 'subreddit',
    query: 'query',
};

function notify(type, items = []) {
    if (!items.length) return;

    const opts = {
        type: 'basic',
        iconUrl: browser.extension.getURL('/images/icon-96.png'),
    };

    if (type === notificationIds.mail) {
        const nOpts = {
            ...opts,
            title: 'Reddit: new mail',
        };
        if (items.length === 1) {
            nOpts.message = `${items.length} new message from ${items[0].data.author}`;
        } else {
            nOpts.message = `${items.length} new messages from ${items.map(({ data }) => data.author).join(', ')}`;
        }
        browser.notifications.create(notificationIds.mail, nOpts);
    }

    if (type === notificationIds.subreddit) {
        const nOpts = {
            ...opts,
            title: 'Reddit: new posts',
            message: `New posts in subreddits: ${items
                .map(({ subreddit, len }) => `${subreddit} (${len})`)
                .join(', ')
            }`,
        };
        browser.notifications.create(notificationIds.subreddit, nOpts);
    }

    if (type === notificationIds.query) {
        const nOpts = {
            ...opts,
            title: 'Reddit: new posts',
            message: `New posts in: ${items
                .map(({ query, len }) => `${query} (${len})`)
                .join(', ')
            }`,
        };
        browser.notifications.create(notificationIds.subreddit, nOpts);
    }
}

browser.notifications.onClicked.addListener(async (id) => {
    if (id === notificationIds.mail) {
        await browser.tabs.create({
            url: 'https://www.reddit.com/message/unread/',
        });
        await storage.removeMessages();
    }
});

export default notify;
