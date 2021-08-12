import type { StorageFields } from '../../../storage/storage-types';
import { getSearchQueryUrl, getSubredditUrl } from '../../../utils';

export type PostGroupType = 'subreddit' | 'search';

export type PostGroup = {
    type: PostGroupType;
    id: string;
    href: string;
    title: string;
    lastPostCreated: number;
    size: number;
};

export const extractPostGroups = (data: StorageFields) => {
    const groupsWithPosts: PostGroup[] = [];
    const groupsWithoutPosts: PostGroup[] = [];

    data.subredditList.forEach((s) => {
        const length = data.subreddits[s]?.posts?.length || 0;
        const lastPostCreated = data.subreddits[s]?.lastPostCreated;
        const group: PostGroup = {
            type: 'subreddit',
            id: s,
            href: getSubredditUrl(s, data.options.useOldReddit),
            title: `r/${s} (${length})`,
            lastPostCreated,
            size: length,
        };
        if (length) {
            groupsWithPosts.push(group);
        } else if (!data.options.hideEmptyGroups) {
            groupsWithoutPosts.push(group);
        }
    });

    data.queriesList.forEach((q) => {
        const length = data.queries[q.id]?.posts?.length || 0;
        const lastPostCreated = data.queries[q.id]?.lastPostCreated;
        const group: PostGroup = {
            type: 'search',
            id: q.id,
            href: getSearchQueryUrl(q.query, q.subreddit, data.options.useOldReddit),
            title: `${q.name || q.query} (${length})`,
            lastPostCreated,
            size: length,
        };
        if (length) {
            groupsWithPosts.push(group);
        } else if (!data.options.hideEmptyGroups) {
            groupsWithoutPosts.push(group);
        }
    });
    groupsWithPosts.sort((a, b) => a.lastPostCreated - b.lastPostCreated);

    return { groupsWithPosts, groupsWithoutPosts };
};
