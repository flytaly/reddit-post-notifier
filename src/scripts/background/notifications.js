import storage from '../storage';

export const notificationIds = {
    mail: 'mail',
    subreddit: 'subreddit',
    query: 'query',
};

const linksToOpen = {
    subreddits: [],
    queries: [],
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

        const links = items.filter((item) => item.link).map((item) => item.link);
        if (links) {
            linksToOpen.subreddits = [...links];
        }

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
        const links = items.filter((item) => item.link).map((item) => item.link);
        if (links) {
            linksToOpen.queries = [...links];
        }
        browser.notifications.create(notificationIds.query, nOpts);
    }
}

browser.notifications.onClicked.addListener(async (id) => {
    if (id === notificationIds.mail) {
        await browser.tabs.create({
            url: 'https://www.reddit.com/message/unread/',
        });
        await storage.removeMessages();
    }

    if (id === notificationIds.subreddit) {
        if (linksToOpen.subreddits) {
            linksToOpen.subreddits.forEach((link, index, array) => {
                browser.tabs.create({
                    url: link,
                    active: index === (array.length - 1),
                });
            });
            linksToOpen.subreddits = [];
            browser.notifications.clear(notificationIds.subreddit);
        }
    }

    if (id === notificationIds.query) {
        if (linksToOpen.queries) {
            linksToOpen.queries.forEach((link, index, array) => {
                browser.tabs.create({
                    url: link,
                    active: index === (array.length - 1),
                });
            });
            linksToOpen.queries = [];
            browser.notifications.clear(notificationIds.query);
        }
    }
});

export default notify;
