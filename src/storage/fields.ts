import DEFAULT_OPTIONS from '../options-default';
import type { StorageFields } from './storage-types';

export const dataFields: StorageFields = {
    accounts: {},
    options: DEFAULT_OPTIONS,
    queries: {},
    queriesList: [],
    subredditList: [],
    subreddits: {},
    pinnedPostList: [],
    notifications: [],
    usersList: [],
};
