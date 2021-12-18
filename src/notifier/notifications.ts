import { browser, Notifications } from 'webextension-polyfill-ts';
import type { RedditMessage } from '../reddit-api/reddit-types';
import type { SoundId } from '../sounds';
import { notificationSoundFiles } from '../sounds';
import storage from '../storage';
import { redditOldUrl, redditUrl } from '../utils';

async function getBaseUrl() {
    const options = await storage.getOptions();
    return options.useOldReddit ? redditOldUrl : redditUrl;
}

function playAudio(audioId: SoundId) {
    const file = notificationSoundFiles[audioId];
    if (!file) return;

    const audio = new Audio();
    audio.src = browser.runtime.getURL(file);
    return audio.play();
}

type NotificationOpts = Notifications.CreateNotificationOptions;

export enum NotificationId {
    mail = 'mail',
    post = 'post',
    user = 'user',
}

export type NewPostsNotification = { len: number; link: string; name: string };
export type NotificationBatch = RedditMessage[] | NewPostsNotification[];

function notify(type: NotificationId, items: NotificationBatch = [], soundId?: SoundId) {
    if (!items.length) return;

    async function createNotification(id: string, options: NotificationOpts, links: string[]) {
        await browser.notifications.create(id, options);
        if (soundId) {
            void playAudio(soundId);
        }
        if (links) void storage.saveNotificationsData(id, links);
    }

    const opts = {
        type: 'basic',
        iconUrl: browser.runtime.getURL('/images/icon-96.png'),
    } as const;

    if (type === NotificationId.mail) {
        items = items as RedditMessage[];
        const message =
            items.length === 1
                ? `${items.length} new message from ${items[0].data.author}`
                : `${items.length} new messages from ${items.map(({ data }) => data.author).join(', ')}`;

        const nOpts: NotificationOpts = { ...opts, title: 'Reddit: new mail', message };

        void getBaseUrl().then((baseUrl) => {
            const url = `${baseUrl}/message/unread/`;
            return createNotification(`${NotificationId.mail}__${Date.now()}`, nOpts, [url]);
        });
    }

    if (type === NotificationId.post) {
        items = items as NewPostsNotification[];
        const nOpts = {
            ...opts,
            title: 'Reddit: new posts',
            message: `New posts in: ${items.map(({ name, len }) => `${name} (${len})`).join(', ')}`,
        };

        const links = items.filter((item) => item.link).map((item) => item.link);
        void createNotification(`${NotificationId.post}__${Date.now()}`, nOpts, [...links]);
    }

    if (type === NotificationId.user) {
        items = items as NewPostsNotification[];
        const nOpts = {
            ...opts,
            title: 'Reddit: new users activities',
            message: items.map(({ len, name }) => `${name} (${len})`).join(', '),
        };
        const links = items.filter((item) => item.link).map((item) => item.link);
        void createNotification(`${NotificationId.post}__${Date.now()}`, nOpts, links);
    }
}

export const addNotificationClickListener = () => {
    const clickHandler = async (notifyId: string) => {
        const notifyArr = await storage.getNotificationsData();
        if (notifyArr && notifyArr.length) {
            const n = notifyArr.find(({ id }) => id === notifyId);
            if (n && n.data && n.data.length) {
                n.data.forEach((link, index, array) => {
                    void browser.tabs.create({ url: link, active: index === array.length - 1 });
                });
            }
            await storage.removeNotificationData(notifyId);
            return browser.notifications.clear(notifyId);
        }
    };

    browser.notifications.onClicked.addListener((notifyId) => void clickHandler(notifyId));
};

export default notify;
