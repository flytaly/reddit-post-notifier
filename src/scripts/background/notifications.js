import storage from '../storage';
import { notificationSoundFiles } from '../sounds';
import { redditOldUrl, redditUrl } from '../utils';

async function getBaseUrl() {
    const options = await storage.getOptions();
    return options.openInOldReddit ? redditOldUrl : redditUrl;
}

function playAudio(audioId) {
    const file = notificationSoundFiles[audioId];
    if (!file) return;

    const audio = new Audio();
    audio.src = browser.runtime.getURL(file);
    audio.play();
}

export const notificationIds = {
    mail: 'mail',
    subreddit: 'subreddit',
    query: 'query',
};

const linksToOpen = {
    subreddits: [],
    queries: [],
};

function notify(type, items = [], soundId) {
    if (!items.length) return;

    function createNotification(id, options) {
        browser.notifications.create(id, options);
        if (soundId) playAudio(soundId);
    }

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
        createNotification(notificationIds.mail, nOpts);
    }

    if (type === notificationIds.subreddit) {
        const nOpts = {
            ...opts,
            title: 'Reddit: new posts',
            message: `New posts in subreddits: ${items
                .map(({ subreddit, len }) => `${subreddit} (${len})`)
                .join(', ')}`,
        };

        const links = items.filter((item) => item.link).map((item) => item.link);
        if (links) {
            linksToOpen.subreddits = [...links];
        }

        createNotification(notificationIds.subreddit, nOpts);
    }

    if (type === notificationIds.query) {
        const nOpts = {
            ...opts,
            title: 'Reddit: new posts',
            message: `New posts in: ${items.map(({ query, len }) => `${query} (${len})`).join(', ')}`,
        };
        const links = items.filter((item) => item.link).map((item) => item.link);
        if (links) {
            linksToOpen.queries = [...links];
        }
        createNotification(notificationIds.query, nOpts);
    }
}

browser.notifications.onClicked.addListener(async (id) => {
    if (id === notificationIds.mail) {
        const baseUrl = await getBaseUrl();
        await browser.tabs.create({ url: `${baseUrl}/message/unread/` });
        await storage.removeMessages();
    }

    if (id === notificationIds.subreddit) {
        if (linksToOpen.subreddits) {
            linksToOpen.subreddits.forEach((link, index, array) => {
                browser.tabs.create({
                    url: link,
                    active: index === array.length - 1,
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
                    active: index === array.length - 1,
                });
            });
            linksToOpen.queries = [];
            browser.notifications.clear(notificationIds.query);
        }
    }
});

export default notify;
