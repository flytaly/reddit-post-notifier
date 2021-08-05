import type { SoundId } from '../sounds';

export type ExtensionOptions = {
    /** seconds between updates */
    updateInterval: number;
    /** seconds between requests */
    waitTimeout: number;
    /** limit the number of post in response */
    limit: number;
    /** show the number of unread private messages */
    messages: boolean;
    messagesNotify: boolean;
    subredditNotify: boolean;
    isAuthorized: boolean;
    theme: 'auto' | 'dark' | 'light' | 'purple';
    /**  expand groups in popup that have at least 'x' number of posts */
    expandWithItems: number;
    /** delete the post after clicking on it */
    delPostAfterBodyClick: boolean;
    hideEmptyGroups: boolean;
    notificationSoundId: null | SoundId;
    /** open links in 'old.reddit.com' */
    useOldReddit: boolean;
};
