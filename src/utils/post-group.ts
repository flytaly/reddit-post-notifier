import type { RedditItem, RedditMessage } from '@/reddit-api/reddit-types';
import storage from '@/storage';
import type { StorageFields } from '@/storage/storage-types';
import { getInboxUrl, getSearchQueryUrl, getSubredditUrl, getUserProfileUrl } from '@/utils';
import { formatError } from '@options/lib/format-error';
import { idToUserIdx } from './index';

export type PostGroupType = 'subreddit' | 'search' | 'user' | 'message';

export type PostGroup = {
    type: PostGroupType;
    id: string;
    href: string;
    title: string;
    lastPostCreated?: number | null;
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

    const mail = storageData.mail || {};

    if (mail.messages?.length) {
        const mailGroup: PostGroup = {
            type: 'message',
            id: 'reddit-mail',
            href: getInboxUrl(storageData.options),
            title: `Reddit messages (${mail.messages.length})`,
            lastPostCreated: mail.lastPostCreated,
            size: mail.messages.length,
            notify: mail.mailNotify ? 'on' : 'off',
            error: mail.error,
        };
        groupsWithPosts.push(mailGroup);
    }

    storageData.subredditList.forEach((s) => {
        const subData = storageData.subreddits[s.id];
        const length = subData?.posts?.length || 0;
        const lastPostCreated = subData?.lastPostCreated;
        const group: PostGroup = {
            type: 'subreddit',
            id: s.id,
            href: getSubredditUrl(s.subreddit, storageData.options),
            title: (s.name || `r/${s.subreddit}`) + ` (${length})`,
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
            href: getSearchQueryUrl(q.query, q.subreddit, storageData.options),
            title: `${q.name || q.query || ''} (${length})`,
            lastPostCreated,
            size: length,
            isMultireddit: q.subreddit ? q.subreddit.includes('+') : true,
            error: formatError(query?.error),
            notify: q.notify ? 'on' : 'off',
            updatesDisabled: q.disabled,
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
            href: getUserProfileUrl(u.username, u.watch, storageData.options),
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

    groupsWithPosts.sort((a, b) => (a.lastPostCreated || 0) - (b.lastPostCreated || 0));

    return { groupsWithPosts, groupsWithoutPosts };
};

export const getGroupItems = (
    data: Pick<StorageFields, 'subreddits' | 'queries' | 'usersList' | 'mail'>,
    id: string,
    type: PostGroupType,
): RedditItem[] | RedditMessage[] => {
    if (type === 'subreddit') {
        return data.subreddits[id].posts || [];
    }
    if (type === 'search') {
        return data.queries[id].posts || [];
    }
    if (type === 'user') {
        const idx = idToUserIdx(id);
        if (idx !== null) return data.usersList?.[idx]?.data || [];
    }
    if (type === 'message') {
        return data.mail?.messages || [];
    }
    return [];
};

export const removePostsFromGroup = async (id: string, type: PostGroupType) => {
    if (type === 'search') return storage.removePostsFrom({ searchId: id });
    if (type === 'subreddit') return storage.removePostsFrom({ subredditId: id });
    if (type === 'user') {
        const index = idToUserIdx(id);
        if (index == null) return;
        return storage.removePostsFrom({ followUserIndex: index });
    }
    if (type === 'message') return storage.removeMessages();
};
