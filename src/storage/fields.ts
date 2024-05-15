import DEFAULT_OPTIONS from '../options-default';
import type { StorageFields } from './storage-types';

export const dataFields: StorageFields = {
    mail: {},
    accounts: {},
    options: DEFAULT_OPTIONS,
    queries: {},
    queriesList: [],
    subredditList: [],
    subreddits: {},
    pinnedPostList: [],
    notifications: [],
    usersList: [],
    showReddixPromo: true,
    /* audio: {} */
};
