import type { RedditError, RedditMessage, RedditPost, RedditPostExtended } from '../reddit-api/reddit-types';
import type { SearchableField, FilterRule } from '../text-search/post-filter';
import type { ExtensionOptions } from '../types/extension-options';

export type AuthData = {
    accessToken?: string;
    expiresIn?: number;
    refreshToken?: string;
};

export type PostFilterOptions = {
    enabled: boolean;
    rules?: FilterRule[];
    fields?: SearchableField[];
};

export type SubredditData = {
    error?: RedditError | null;
    /**  the newest post's id */
    lastPost?: string;
    lastPostCreated?: number;
    lastUpdate?: number;
    posts?: RedditPost[];
};

export type QueryData = SubredditData;

export type MessageData = {
    count?: number;
    lastPostCreated?: number;
    lastUpdate?: number;
    messages?: RedditMessage[];
};

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
    notify?: boolean;
    disabled?: boolean;
    filterOpts?: PostFilterOptions;
};

export type PostsToSaveData = {
    posts?: RedditPost[] | RedditPostExtended[];
    error?: RedditError | null;
    limit?: number;
};

export type StorageFields = {
    options: ExtensionOptions;

    messages: MessageData;
    notifications: { id: string; data: string[] }[];
    pinnedPostList: RedditPost[];
    queries: Record<string, QueryData>;
    queriesList: QueryOpts[];
    subredditList: SubredditOpts[];
    subreddits: Record<string, SubredditData>;
} & AuthData;
