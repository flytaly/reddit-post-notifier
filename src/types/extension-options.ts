import type { SoundId } from '../sounds';

export type ExtensionOptions = {
    /** seconds between updates */
    updateInterval: number;
    /** seconds between requests */
    waitTimeout: number;
    /** limit the number of post in response */
    limit: number;
    theme: 'auto' | 'dark' | 'light' | 'purple';
    /**  expand groups in popup that have at least 'x' number of posts */
    expandWithItems: number;
    /** delete the post after clicking on it */
    delPostAfterBodyClick: boolean;
    /** delete the item list after opening */
    delListAfterOpening: boolean;
    hideEmptyGroups: boolean;
    notificationSoundId: null | SoundId;
    /** open links in 'old.reddit.com'*/
    /* useOldReddit: boolean; */

    /** which reddit address to use */
    redditUrlType: 'new' | '' | 'old' | 'custom';
    /** use custom reddit url like troddit */
    customRedditUrl: string;
    /** seconds between updates of following user's posts (ignored if < updateInterval) */
    pollUserInterval: number;
};
