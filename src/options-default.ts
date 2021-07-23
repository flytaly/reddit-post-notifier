import type { ExtensionOptions } from './types/env';

const DEFAULT_OPTIONS: ExtensionOptions = {
    updateInterval: 60,
    waitTimeout: 1.5,
    limit: 10,
    messages: false,
    messagesNotify: false,
    subredditNotify: false,
    isAuthorized: false,
    theme: 'auto',
    expandWithItems: 5,
    delPostAfterBodyClick: false,
    hideEmptyGroups: false,
    notificationSoundId: null,
    useOldReddit: false,
};

export default DEFAULT_OPTIONS;
