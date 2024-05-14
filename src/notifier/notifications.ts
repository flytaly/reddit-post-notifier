import type { Notifications } from 'webextension-polyfill';
import browser from 'webextension-polyfill';
import { type SoundId, playAudio } from '../sounds';
import storage from '../storage';
import { getInboxUrl } from '../utils';

type NotificationOpts = Notifications.CreateNotificationOptions;

export enum NotificationId {
    mail = 'mail',
    post = 'post',
    user = 'user',
    test = 'test',
}

export interface TestNotification { type: NotificationId.test; message: string }

export interface MessageNotification {
    type: NotificationId.mail;
    items: { len: number; username: string }[];
}

export interface PostNotification {
    type: NotificationId.post;
    items: { len: number; link: string; name: string }[];
}

export interface UserNotification {
    type: NotificationId.user;
    items: { len: number; link: string; name: string }[];
}

type Notification = MessageNotification | PostNotification | UserNotification | TestNotification;

function isMessage(n: Notification): n is MessageNotification {
    return n.type === NotificationId.mail;
}

function isPost(n: Notification): n is UserNotification {
    return n.type === NotificationId.post;
}

function isUser(n: Notification): n is UserNotification {
    return n.type === NotificationId.user;
}

function isTest(n: Notification): n is TestNotification {
    return n.type === NotificationId.test;
}

function notify(notif: Notification, soundId?: SoundId | null) {
    async function createNotification(id: string, options: NotificationOpts, links?: string[]) {
        await browser.notifications.create(id, options);
        if (soundId)
            void playAudio(soundId);

        if (links)
            void storage.saveNotificationsData(id, links);
    }

    const opts = {
        type: 'basic',
        iconUrl: browser.runtime.getURL('/images/icon-96.png'),
    } as const;

    if (isTest(notif)) {
        const nOpts = { ...opts, title: 'Test title', message: notif.message };
        void createNotification(`${NotificationId.test}__${Date.now()}`, nOpts);
        return;
    }

    if (!notif.items.length)
        return;

    if (isMessage(notif)) {
        const message = notif.items
            .map((i) => {
                if (i.username)
                    return `${i.username || ''} (${i.len})`;
                return `${i.len} unread messages`;
            })
            .join(',\n');

        const nOpts: NotificationOpts = { ...opts, title: 'Reddit: new mail', message };

        void storage.getOptions().then((opts) => {
            const url = getInboxUrl(opts);
            return createNotification(`${NotificationId.mail}__${Date.now()}`, nOpts, [url]);
        });
    }

    if (isPost(notif)) {
        const nOpts = {
            ...opts,
            title: 'Reddit: new posts',
            message: `New posts in: ${notif.items.map(({ name, len }) => `${name} (${len})`).join(', ')}`,
        };

        const links = notif.items.filter(item => item.link).map(item => item.link);
        void createNotification(`${NotificationId.post}__${Date.now()}`, nOpts, [...links]);
    }

    if (isUser(notif)) {
        const nOpts = {
            ...opts,
            title: 'Reddit: new users activities',
            message: notif.items.map(({ len, name }) => `${name} (${len})`).join(', '),
        };
        const links = notif.items.filter(item => item.link).map(item => item.link);
        void createNotification(`${NotificationId.post}__${Date.now()}`, nOpts, links);
    }
}

export function addNotificationClickListener() {
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

    browser.notifications.onClicked.addListener(notifyId => void clickHandler(notifyId));
}

export default notify;
