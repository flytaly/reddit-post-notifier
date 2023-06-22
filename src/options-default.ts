import type { ExtensionOptions } from './types/extension-options';

const DEFAULT_OPTIONS: ExtensionOptions = {
    updateInterval: 60,
    waitTimeout: 3,
    limit: 25,
    theme: 'auto',
    expandWithItems: 5,
    delPostAfterBodyClick: false,
    delListAfterOpening: false,
    hideEmptyGroups: false,
    notificationSoundId: null,
    pollUserInterval: 10 * 60,
    redditUrlType: 'new',
    customRedditUrl: 'https://troddit.com/',
    onBadgeClick: 'popup',
};

export default DEFAULT_OPTIONS;
