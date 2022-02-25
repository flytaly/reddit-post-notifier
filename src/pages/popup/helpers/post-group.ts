import type { StorageFields } from '@/storage/storage-types';
import { getInboxUrl, getSearchQueryUrl, getSubredditUrl, getUserProfileUrl } from '@/utils';
import { formatError } from '@/pages/options/format-error';
import { idToUserIdx } from '.';
import type { RedditItem, RedditMessage } from '../../../reddit-api/reddit-types';

export type PostGroupType = 'subreddit' | 'search' | 'user' | 'message';

export type PostGroup = {
    type: PostGroupType;
    id: string;
    href: string;
    title: string;
    lastPostCreated: number;
    size: number;
    isMultireddit?: boolean;
    notify?: 'on' | 'off' | null;
    filter?: 'on' | 'off' | null;
    error?: string | null;
    updatesDisabled?: boolean;
};

export const extractPostGroups = (storageData: StorageFields) => {
    const groupsWithPosts: PostGroup[] = [];
    const groupsWithoutPosts: PostGroup[] = [];

    const accList = Object.values(storageData.accounts || {});
    const { useOldReddit } = storageData.options;

    accList.forEach((a) => {
        let error = a.error || a.auth.error;
        if (!a.auth.refreshToken) error = 'Refresh token is missing. Please reauthorize the account.';
        const length = a.mail?.messages?.length || 0;
        const lastPostCreated = a.mail?.lastPostCreated;
        const group: PostGroup = {
            type: 'message',
            id: a.id,
            href: getInboxUrl(useOldReddit),
            title: `${a.name || ''} inbox (${length})`,
            lastPostCreated,
            size: length,
            notify: a.mailNotify ? 'on' : 'off',
            error,
            updatesDisabled: !a.checkMail,
        };
        if (length) {
            groupsWithPosts.push(group);
        } else if (!storageData.options.hideEmptyGroups) {
            groupsWithoutPosts.push(group);
        }
    });

    storageData.subredditList.forEach((s) => {
        const subData = storageData.subreddits[s.id];
        const length = subData?.posts?.length || 0;
        const lastPostCreated = subData?.lastPostCreated;
        const group: PostGroup = {
            type: 'subreddit',
            id: s.id,
            href: getSubredditUrl(s.subreddit, useOldReddit),
            title: `r/${s.subreddit} (${length})`,
            lastPostCreated,
            size: length,
            isMultireddit: s.subreddit.includes('+'),
            notify: s.notify ? 'on' : 'off',
            error: formatError(subData?.error),
            filter: s.filterOpts?.enabled ? 'on' : 'off',
            updatesDisabled: s.disabled,
        };
        if (length) {
            groupsWithPosts.push(group);
        } else if (!storageData.options.hideEmptyGroups) {
            groupsWithoutPosts.push(group);
        }
    });

    storageData.queriesList.forEach((q) => {
        const query = storageData.queries[q.id];
        const length = query?.posts?.length || 0;
        const lastPostCreated = query?.lastPostCreated;
        const group: PostGroup = {
            type: 'search',
            id: q.id,
            href: getSearchQueryUrl(q.query, q.subreddit, useOldReddit),
            title: `${q.name || q.query} (${length})`,
            lastPostCreated,
            size: length,
            isMultireddit: q.subreddit ? q.subreddit.includes('+') : true,
            error: formatError(query?.error),
            notify: q.notify ? 'on' : 'off',
        };
        if (length) {
            groupsWithPosts.push(group);
        } else if (!storageData.options.hideEmptyGroups) {
            groupsWithoutPosts.push(group);
        }
    });

    storageData.usersList?.forEach((u, idx) => {
        if (!u.username) return;
        const length = u.data?.length || 0;
        let watchType = '';
        if (u.watch === 'comments') watchType = 'comments';
        if (u.watch === 'submitted') watchType = 'posts';

        const group: PostGroup = {
            type: 'user',
            id: `user_${idx}`,
            href: getUserProfileUrl(u.username, u.watch, useOldReddit),
            title: `u/${u.username} ${watchType} (${length})`,
            lastPostCreated: u.lastPostCreated,
            size: length,
            isMultireddit: true,
            notify: u.notify ? 'on' : 'off',
            error: formatError(u.error),
        };
        if (length) {
            groupsWithPosts.push(group);
        } else if (!storageData.options.hideEmptyGroups) {
            groupsWithoutPosts.push(group);
        }
    });

    groupsWithPosts.sort((a, b) => a.lastPostCreated - b.lastPostCreated);

    return { groupsWithPosts, groupsWithoutPosts };
};

export const getGroupItems = (
    data: Pick<StorageFields, 'subreddits' | 'queries' | 'usersList' | 'accounts'>,
    id: string,
    type: PostGroupType,
): RedditItem[] | RedditMessage[] => {
    if (type === 'subreddit') {
        return data.subreddits[id].posts;
    }
    if (type === 'search') {
        return data.queries[id].posts;
    }
    if (type === 'user') {
        const idx = idToUserIdx(id);
        if (idx !== undefined) return data.usersList[idx]?.data;
    }
    if (type === 'message') {
        return data.accounts?.[id]?.mail?.messages || [];
    }
    return [];
};
