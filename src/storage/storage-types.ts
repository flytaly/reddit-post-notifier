import type { RedditError, RedditMessage, RedditPost } from '../reddit-api/reddit-types';
import type { ExtensionOptions } from '../types/extension-options';

export type AuthData = {
    accessToken?: string;
    expiresIn?: number;
    refreshToken?: string;
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
};

export type SubredditOpts = {
    id: string;
    subreddit: string;
    notify?: boolean;
    disabled?: boolean;
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
