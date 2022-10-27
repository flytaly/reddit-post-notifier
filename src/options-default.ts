import type { ExtensionOptions } from './types/extension-options';

const DEFAULT_OPTIONS: ExtensionOptions = {
    updateInterval: 60,
    waitTimeout: 1.5,
    limit: 10,
    theme: 'auto',
    expandWithItems: 5,
    delPostAfterBodyClick: false,
    delListAfterOpening: false,
    hideEmptyGroups: false,
    notificationSoundId: null,
    pollUserInterval: 10 * 60,
    redditUrlType: 'new',
    customRedditUrl: 'https://troddit.com/',
};

export default DEFAULT_OPTIONS;
