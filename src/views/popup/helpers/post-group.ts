import type { StorageFields } from '@/storage/storage-types';
import { getSearchQueryUrl, getSubredditUrl, getUserProfileUrl } from '@/utils';
import { idToUserIdx } from '.';
import type { RedditItem } from '../../../reddit-api/reddit-types';

export type PostGroupType = 'subreddit' | 'search' | 'user';

export type PostGroup = {
    type: PostGroupType;
    id: string;
    href: string;
    title: string;
    lastPostCreated: number;
    size: number;
    isMultireddit?: boolean;
};

export const extractPostGroups = (sData: StorageFields) => {
    const groupsWithPosts: PostGroup[] = [];
    const groupsWithoutPosts: PostGroup[] = [];

    sData.subredditList.forEach((s) => {
        const length = sData.subreddits[s.id]?.posts?.length || 0;
        const lastPostCreated = sData.subreddits[s.id]?.lastPostCreated;
        const group: PostGroup = {
            type: 'subreddit',
            id: s.id,
            href: getSubredditUrl(s.subreddit, sData.options.useOldReddit),
            title: `r/${s.subreddit} (${length})`,
            lastPostCreated,
            size: length,
            isMultireddit: s.subreddit.includes('+'),
        };
        if (length) {
            groupsWithPosts.push(group);
        } else if (!sData.options.hideEmptyGroups) {
            groupsWithoutPosts.push(group);
        }
    });

    sData.queriesList.forEach((q) => {
        const length = sData.queries[q.id]?.posts?.length || 0;
        const lastPostCreated = sData.queries[q.id]?.lastPostCreated;
        const group: PostGroup = {
            type: 'search',
            id: q.id,
            href: getSearchQueryUrl(q.query, q.subreddit, sData.options.useOldReddit),
            title: `${q.name || q.query} (${length})`,
            lastPostCreated,
            size: length,
            isMultireddit: q.subreddit ? q.subreddit.includes('+') : true,
        };
        if (length) {
            groupsWithPosts.push(group);
        } else if (!sData.options.hideEmptyGroups) {
            groupsWithoutPosts.push(group);
        }
    });

    sData.usersList?.forEach((u, idx) => {
        if (!u.username) return;
        const length = u.data?.length || 0;
        let watchType = '';
        if (u.watch === 'comments') watchType = 'comments';
        if (u.watch === 'submitted') watchType = 'posts';

        const group: PostGroup = {
            type: 'user',
            id: `user_${idx}`,
            href: getUserProfileUrl(u.username, u.watch, sData.options.useOldReddit),
            title: `u/${u.username} ${watchType} (${length})`,
            lastPostCreated: u.lastPostCreated,
            size: length,
            isMultireddit: true,
        };
        if (length) {
            groupsWithPosts.push(group);
        } else if (!sData.options.hideEmptyGroups) {
            groupsWithoutPosts.push(group);
        }
    });

    groupsWithPosts.sort((a, b) => a.lastPostCreated - b.lastPostCreated);

    return { groupsWithPosts, groupsWithoutPosts };
};

export const getGroupItems = (
    data: Pick<StorageFields, 'subreddits' | 'queries' | 'usersList'>,
    id: string,
    type: PostGroupType,
): RedditItem[] => {
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
    return [];
};
