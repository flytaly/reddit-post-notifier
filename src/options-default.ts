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
    useOldReddit: false,
    pollUserInterval: 10 * 60,
};

export default DEFAULT_OPTIONS;
