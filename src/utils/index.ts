import type { RedditPost, RedditPostData, RedditPostExtended } from '../reddit-api/reddit-types';
import type { RedditScope } from '@/reddit-api/scopes';
import type redditScopes from '@/reddit-api/scopes';
import type { StorageFields } from '@/storage/storage-types';
import type { ExtensionOptions } from '@/types/extension-options';
import { RedditObjectKind } from '@/reddit-api/reddit-types';
import type { RedditItem } from '@/reddit-api/reddit-types';

export function mapObjToQueryStr(params: Record<string, unknown>): string {
    return Object.entries(params)
        .map(pair => pair.join('='))
        .join('&');
}

export const subredditNameRegExp = /^[A-Z0-9]\w{2,20}$/i;

//* * test all subreddits name in multireddit */
export const testMultireddit = (subs: string) => subs.split('+').every(s => subredditNameRegExp.test(s));

export const redditUrl = 'https://reddit.com';
export const redditOldUrl = 'https://old.reddit.com';

export function getRedditBaseUrl(urlType: ExtensionOptions['redditUrlType'], customUrl: string): string {
    switch (urlType) {
        case 'old':
            return redditOldUrl;
        case 'custom':
            return customUrl;
        default:
            return redditUrl;
    }
}

export const generateId = () => Math.random().toString(36).substring(2, 6) + new Date().getTime().toString(36);

type UrlOpts = Pick<ExtensionOptions, 'redditUrlType' | 'customRedditUrl'>;

export function constructUrl(endpoint: string, opts: UrlOpts): string {
    try {
        return new URL(endpoint, getRedditBaseUrl(opts.redditUrlType, opts.customRedditUrl)).href;
    }
    catch {
        return new URL(endpoint, redditUrl).href;
    }
}

export function getSubredditUrl(subreddit: string, opts: UrlOpts): string {
    const endpoint = `/r/${subreddit}/new`;
    return constructUrl(endpoint, opts);
}

export function getInboxUrl(opts: UrlOpts): string {
    const endpoint = '/message/inbox';
    return constructUrl(endpoint, opts);
}

export function getSearchQueryUrl(query = '', subreddit = '', opts: UrlOpts): string {
    const endpoint = subreddit
        ? `/r/${subreddit}/search?sort=new&restrict_sr=on&q=${query}`
        : `/search?q=${query}&sort=new`;

    return constructUrl(endpoint, opts);
}

export function getUserProfileUrl(username: string, type: 'overview' | 'submitted' | 'comments' = 'overview', opts: UrlOpts): string {
    let endpoint = `/user/${username}`;
    if (type === 'comments')
        endpoint += '/comments';

    if (type === 'submitted')
        endpoint += opts.redditUrlType === 'old' ? '/submitted' : '/posts';

    return constructUrl(endpoint, opts);
}

export function debounce<F extends (...args: Parameters<F>) => unknown>(
    func: F,
    waitMs: number,
): (...args: Parameters<F>) => void {
    let waiting = false;
    let tmId: ReturnType<typeof setTimeout>;

    return (...args: Parameters<F>) => {
        if (waiting)
            clearTimeout(tmId);
        waiting = true;
        tmId = setTimeout(() => {
            func(...args);
            waiting = false;
        }, waitMs);
    };
}

// Filter out keys from object
export function filterKeys<T>(allowedKeys: string[], obj: Record<string, T> = {}): Record<string, T> {
    return allowedKeys.reduce(
        (acc, key) => {
            acc[key] = obj[key];
            return acc;
        },
        {} as typeof obj,
    );
}

/** Filter out not needed properties in the Reddit post */
export function filterPostDataProperties(post: RedditPostExtended | RedditPost): RedditPost {
    if (!post?.data)
        return post;
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
        'is_gallery',
        'media_metadata',
    ];

    const data = filterKeys(filterList, post.data as Record<string, unknown>) as any as RedditPostData;

    if ((data.selftext?.length || 0) > 400)
        data.selftext = data.selftext?.slice(0, 400);

    return { ...post, data };
}

export function getAccountByScope(accounts: StorageFields['accounts'], scopeList?: (keyof typeof redditScopes)[]) {
    const fit = Object.values(accounts || {}).filter((ac) => {
        if (scopeList?.length) {
            if (!ac.auth.scope?.length)
                return false;
            const acScopes = ac.auth.scope.split(' ') as RedditScope[];
            if (!scopeList.every(s => acScopes.includes(s)))
                return false;
        }

        return ac.auth.refreshToken;
    });

    return fit.length ? fit[0] : null;
}

export function getItemTitle(post: RedditItem) {
    if (post.kind === RedditObjectKind.link)
        return post.data.title;
    else if (post.kind === RedditObjectKind.comment)
        return post.data.body?.length > 80 ? `${post.data.body.slice(0, 80)}...` : post.data.body;
}

export function idToUserIdx(id: string): number | null {
    const indexNum = Number.parseInt(id.split('_')[1]);
    if (!Number.isNaN(indexNum))
        return indexNum;
    return null;
}
