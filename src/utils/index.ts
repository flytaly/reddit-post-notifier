import type { RedditScope } from '@/reddit-api/scopes';
import type redditScopes from '@/reddit-api/scopes';
import type { StorageFields } from '@/storage/storage-types';
import type { RedditPost, RedditPostData, RedditPostExtended } from '../reddit-api/reddit-types';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export const mapObjToQueryStr = (params: Record<string, unknown>): string =>
    Object.entries(params)
        .map((pair) => pair.join('='))
        .join('&');

export const $: ParentNode['querySelector'] = document.querySelector.bind(document);

export const subredditNameRegExp = /^[A-Za-z0-9]\w{2,20}$/;

//** test all subreddits name in multireddit */
export const testMultireddit = (subs: string) => subs.split('+').every((s) => subredditNameRegExp.test(s));

export const redditUrl = 'https://reddit.com';
export const redditOldUrl = 'https://old.reddit.com';

export const generateId = () => Math.random().toString(36).substring(2, 6) + new Date().getTime().toString(36);

export const getSubredditUrl = (subreddit: string, oldReddit = false): string =>
    `${oldReddit ? redditOldUrl : redditUrl}/r/${subreddit}/new`;

export const getInboxUrl = (oldReddit = false): string => `${oldReddit ? redditOldUrl : redditUrl}/message/inbox`;

export const getSearchQueryUrl = (query: string, subreddit = '', oldReddit = false): string => {
    const endpoint = subreddit
        ? `/r/${subreddit}/search?sort=new&restrict_sr=on&q=${query}`
        : `/search?q=${query}&sort=new`;

    return `${oldReddit ? redditOldUrl : redditUrl}${endpoint}`;
};

export const getUserProfileUrl = (
    username: string,
    type: 'overview' | 'submitted' | 'comments' = 'overview',
    oldReddit = false,
) => {
    const base = `${oldReddit ? redditOldUrl : redditUrl}/user/${username}`;
    if (type === 'comments') return `${base}/comments`;
    if (type === 'submitted') {
        return oldReddit ? `${base}/submitted` : `${base}/posts`;
    }
    return base;
};

export const debounce = (func: (...args: unknown[]) => unknown, waitMs: number) => {
    let waiting = false;
    let tmId: ReturnType<typeof setTimeout>;
    return (...args: unknown[]) => {
        if (waiting) clearTimeout(tmId);
        waiting = true;
        tmId = setTimeout(() => {
            func(...args);
            waiting = false;
        }, waitMs);
    };
};

// Filter out keys from object
export function filterKeys<T>(allowedKeys: string[], obj: Record<string, T> = {}): Record<string, T> {
    return allowedKeys.reduce((acc, key) => {
        acc[key] = obj[key];
        return acc;
    }, {});
}

/** Filter out not needed properties in the Reddit post */
export const filterPostDataProperties = (post: RedditPostExtended): RedditPost => {
    if (!post?.data) return post;
    const filterList: Array<keyof RedditPostData> = [
        'author',
        'created_utc',
        'created',
        'id',
        'link_flair_text',
        'name',
        'over_18',
        'permalink',
        'preview',
        'selftext',
        'subreddit',
        'title',
        'url',
    ];

    const data = filterKeys(filterList, post.data) as RedditPostData;

    if (data.selftext?.length > 400) {
        data.selftext = data.selftext.slice(0, 400);
    }

    return { ...post, data };
};

export const getAccountByScope = (accounts: StorageFields['accounts'], scopeList?: (keyof typeof redditScopes)[]) => {
    const fit = Object.values(accounts || {}).filter((ac) => {
        if (scopeList?.length) {
            if (!ac.auth.scope?.length) return false;
            const acScopes = ac.auth.scope.split(' ') as RedditScope[];
            if (!scopeList.every((s) => acScopes.includes(s))) return false;
        }

        return ac.auth.refreshToken;
    });

    return fit.length ? fit[0] : null;
};
