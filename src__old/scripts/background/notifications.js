import storage from '../storage';
import { notificationSoundFiles } from '../sounds';
import { redditOldUrl, redditUrl } from '../utils';

async function getBaseUrl() {
    const options = await storage.getOptions();
    return options.useOldReddit ? redditOldUrl : redditUrl;
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

function notify(type, items = [], soundId) {
    if (!items.length) return;

    function createNotification(id, options, payload) {
        browser.notifications.create(id, options);
        if (soundId) playAudio(soundId);
        if (payload) storage.saveNotificationsData(id, payload);
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

        getBaseUrl().then((baseUrl) => {
            const url = `${baseUrl}/message/unread/`;
            createNotification(`${notificationIds.mail}__${Date.now()}`, nOpts, [url]);
        });
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
        createNotification(`${notificationIds.subreddit}__${Date.now()}`, nOpts, [...links]);
    }

    if (type === notificationIds.query) {
        const nOpts = {
            ...opts,
            title: 'Reddit: new posts',
            message: `New posts in: ${items.map(({ query, len }) => `${query} (${len})`).join(', ')}`,
        };
        const links = items.filter((item) => item.link).map((item) => item.link);
        createNotification(`${notificationIds.query}__${Date.now()}`, nOpts, [...links]);
    }
}

browser.notifications.onClicked.addListener(async (notifyId) => {
    const notifyArr = await storage.getNotificationsData();
    if (notifyArr && notifyArr.length) {
        const n = notifyArr.find(({ id }) => id === notifyId);
        if (n && n.data && n.data.length) {
            n.data.forEach((link, index, array) => {
                browser.tabs.create({ url: link, active: index === array.length - 1 });
            });
        }
        await storage.removeNotificationData(notifyId);
        browser.notifications.clear(notifyId);
    }
});

export default notify;
