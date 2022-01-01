import { browser } from 'webextension-polyfill-ts';
import type { Notifications } from 'webextension-polyfill-ts';
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

export type MessageNotification = {
    type: NotificationId.mail;
    items: { len: number; username: string }[];
};

export type PostNotification = {
    type: NotificationId.post;
    items: { len: number; link: string; name: string }[];
};

export type UserNotification = {
    type: NotificationId.user;
    items: { len: number; link: string; name: string }[];
};

type Notification = MessageNotification | PostNotification | UserNotification;

function isMessage(n: Notification): n is MessageNotification {
    return n.type === NotificationId.mail;
}

function isPost(n: Notification): n is UserNotification {
    return n.type === NotificationId.post;
}

function isUser(n: Notification): n is UserNotification {
    return n.type === NotificationId.user;
}

function notify(notif: Notification, soundId?: SoundId) {
    if (!notif.items.length) return;

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

    if (isMessage(notif)) {
        const message = notif.items.map((i) => `${i.username || ''} (${i.len})`).join(', ');

        const nOpts: NotificationOpts = { ...opts, title: 'Reddit: new mail', message };

        void getBaseUrl().then((baseUrl) => {
            const url = `${baseUrl}/message/unread/`;
            return createNotification(`${NotificationId.mail}__${Date.now()}`, nOpts, [url]);
        });
    }

    if (isPost(notif)) {
        const nOpts = {
            ...opts,
            title: 'Reddit: new posts',
            message: `New posts in: ${notif.items.map(({ name, len }) => `${name} (${len})`).join(', ')}`,
        };

        const links = notif.items.filter((item) => item.link).map((item) => item.link);
        void createNotification(`${NotificationId.post}__${Date.now()}`, nOpts, [...links]);
    }

    if (isUser(notif)) {
        const nOpts = {
            ...opts,
            title: 'Reddit: new users activities',
            message: notif.items.map(({ len, name }) => `${name} (${len})`).join(', '),
        };
        const links = notif.items.filter((item) => item.link).map((item) => item.link);
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
