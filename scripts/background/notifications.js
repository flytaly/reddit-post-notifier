export const notificationIds = {
    mail: 'mail',
    subreddit: 'subreddit',
    query: 'query',
};

function notify(type, items = []) {
    if (!items.length) return;

    if (type === notificationIds.mail) {
        const nOpts = {
            type: 'basic',
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
            type: 'basic',
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
            type: 'basic',
            title: 'Reddit: new posts',
            message: `New posts in: ${items
                .map(({ query, len }) => `${query} (${len})`)
                .join(', ')
            }`,
        };
        browser.notifications.create(notificationIds.subreddit, nOpts);
    }
}

browser.notifications.onClicked.addListener((id) => {
    if (id === notificationIds.mail) {
        browser.tabs.create({
            url: 'https://www.reddit.com/message/unread/',
        });
    }
});

export default notify;
