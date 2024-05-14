import type {
    RedditComment,
    RedditError,
    RedditMessage,
    RedditPost,
    RedditPostExtended,
} from '../reddit-api/reddit-types';
import type { FilterRule, SearchableField } from '../text-search/post-filter';
import type { ExtensionOptions } from '../types/extension-options';

export interface AuthUser {
    id: string;
    checkMail?: boolean;
    mailNotify?: boolean;

    auth: {
        accessToken?: string | null;
        expiresIn?: number;
        refreshToken?: string | null;
        scope?: string;
        error?: string | null;
    };

    // reddit data
    name?: string;
    redditId?: string;
    img?: string;
    totalKarma?: number;
    inboxCount?: number;
    hasMail?: boolean;
    error?: string | null;

    mail?: {
        messages: RedditMessage[];
        lastUpdate?: number;
        lastPostCreated?: number;
    };
}

export interface PostFilterOptions {
    enabled?: boolean;
    rules?: FilterRule[];
    fields?: SearchableField[];
}

export interface SubredditData {
    error?: RedditError | null;
    /**  the newest post's id */
    lastPost?: string;
    lastPostCreated?: number | null;
    lastUpdate?: number;
    posts?: RedditPost[];
}

export type QueryData = SubredditData;

/** Reddit Search query */
export interface QueryOpts {
    /** Query's id */
    id: string;
    /** Reddit Search query */
    query?: string;
    /** Optional name of the query */
    name?: string;
    /** Subreddit name, multireddit string or empty. If empty, search in the whole reddit. */
    subreddit?: string;
    /** Show notification */
    notify?: boolean;
    /** Skip updates */
    disabled?: boolean;
}

export interface SubredditOpts {
    id: string;
    subreddit: string;
    name?: string;
    notify?: boolean;
    disabled?: boolean;
    filterOpts?: PostFilterOptions;
}

export interface PostsToSaveData {
    posts?: RedditPost[] | RedditPostExtended[];
    error?: RedditError | null;
    limit?: number;
    lastPostCreated?: number | null;
}

export interface FollowingUser {
    username: string;
    data?: (RedditPost | RedditComment)[];
    watch?: 'overview' | 'comments' | 'submitted';
    notify?: boolean;
    lastPostCreated?: number | null;
    lastUpdate?: number | null;
    error?: RedditError | null;
}

export interface MailInfo {
    error?: string | null;
    messages?: RedditMessage[];
    lastUpdate?: number;
    lastPostCreated?: number;
    mailNotify?: boolean;
    checkMail?: boolean;
}

export interface StorageFields {
    options: ExtensionOptions;

    accounts?: Record<string, AuthUser>;
    notifications: { id: string; data: string[] }[];
    pinnedPostList: RedditPost[];
    queries: Record<string, QueryData>;
    queriesList: QueryOpts[];
    subredditList: SubredditOpts[];
    subreddits: Record<string, SubredditData>;
    usersList?: FollowingUser[];
    audio?: { dataUrl?: string };
    mail?: MailInfo;
}
