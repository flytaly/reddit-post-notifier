import DEFAULT_OPTIONS from '../options-default';
import type { AuthData, StorageFields } from './storage-types';

export const authDataDefault: AuthData = {
    accessToken: '',
    expiresIn: 0,
    refreshToken: '',
    scope: '',
};

export const dataFields: StorageFields = {
    ...authDataDefault,
    options: DEFAULT_OPTIONS,
    queries: {},
    queriesList: [],
    subredditList: [],
    subreddits: {},
    messages: {},
    pinnedPostList: [],
    notifications: [],
    usersList: [],
};
