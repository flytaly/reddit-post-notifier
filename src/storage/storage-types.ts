import type {
    RedditComment,
    RedditError,
    RedditMessage,
    RedditPost,
    RedditPostExtended,
} from '../reddit-api/reddit-types';
import type { SearchableField, FilterRule } from '../text-search/post-filter';
import type { ExtensionOptions } from '../types/extension-options';

export type PostFilterOptions = {
    enabled?: boolean;
    rules?: FilterRule[];
    fields?: SearchableField[];
};

export type SubredditData = {
    error?: RedditError | null;
    /**  the newest post's id */
    lastPost?: string;
    lastPostCreated?: number | null;
    lastUpdate?: number;
    posts?: RedditPost[];
};

export type QueryData = SubredditData;

/** Reddit Search query*/
export type QueryOpts = {
    /** Query's id */
    id: string;
    /** Reddit Search query*/
    query?: string;
    /** Optional name of the query */
    name?: string;
    /** Subreddit name, multireddit string or empty. If empty, search in the whole reddit. */
    subreddit?: string;
    /** Show notification */
    notify?: boolean;
    /** Skip updates */
    disabled?: boolean;
};

export type SubredditOpts = {
    id: string;
    subreddit: string;
    name?: string;
    notify?: boolean;
    disabled?: boolean;
    filterOpts?: PostFilterOptions;
};

export type PostsToSaveData = {
    posts?: RedditPost[] | RedditPostExtended[];
    error?: RedditError | null;
    limit?: number;
    lastPostCreated?: number | null;
};

export type FollowingUser = {
    username: string;
    data?: (RedditPost | RedditComment)[];
    watch?: 'overview' | 'comments' | 'submitted';
    notify?: boolean;
    lastPostCreated?: number | null;
    lastUpdate?: number | null;
    error?: RedditError | null;
};

export type MailInfo = {
    error?: string | null;
    messages?: RedditMessage[];
    lastUpdate?: number;
    lastPostCreated?: number;
    mailNotify?: boolean;
    checkMail?: boolean;
};

export type StorageFields = {
    options: ExtensionOptions;

    notifications: { id: string; data: string[] }[];
    pinnedPostList: RedditPost[];
    queries: Record<string, QueryData>;
    queriesList: QueryOpts[];
    subredditList: SubredditOpts[];
    subreddits: Record<string, SubredditData>;
    usersList?: FollowingUser[];
    audio?: { dataUrl?: string };
    mail?: MailInfo;
};
