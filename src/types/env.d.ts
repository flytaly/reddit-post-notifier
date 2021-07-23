import type { SoundId } from '../sounds';

declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: 'production' | 'development' | 'test';
        TARGET: 'chrome' | 'firefox';

        CHROME_CLIENT_ID: string;
        CHROME_CLIENT_SECRET: string;
        CHROME_REDIRECT_URI: string;
        CHROME_USER_AGENT: string;
        FIREFOX_CLIENT_ID: string;
        FIREFOX_CLIENT_SECRET: string;
        FIREFOX_REDIRECT_URI: string;
        FIREFOX_USER_AGENT: string;
    }
}

type ExtensionOptions = {
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
    theme: 'auto';
    /**  expand groups in popup that have at least 'x' number of posts */
    expandWithItems: number;
    /** delete the post after clicking on it */
    delPostAfterBodyClick: boolean;
    hideEmptyGroups: boolean;
    notificationSoundId: null | SoundId;
    /** open links in 'old.reddit.com' */
    useOldReddit: boolean;
};
