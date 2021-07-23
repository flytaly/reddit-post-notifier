import type { RedditPost } from '../reddit-api/reddit-types';

export type MessagesField = {
    count?: number;
    lastPostCreated?: number;
    lastUpdate?: number;
    messages?: [];
};

export type AuthData = {
    accessToken?: string;
    expiresIn?: number;
    refreshToken?: string;
};

export type SubredditData = {
    error?: { message: string } | null;
    /**  the newest post's id */
    lastPost?: string;
    lastPostCreated?: number;
    lastUpdate?: number;
    posts?: RedditPost[];
};

export type QueryData = SubredditData;

/** Reddit Search query*/
export type QueryOpts = {
    /** Query's id */
    id: string;
    /** Reddit Search query*/
    query: string;
    /** Optional name of the query */
    name?: string;
    /** Subreddit name, multireddit string or empty. If empty, search in the whole reddit. */
    subreddit?: string;
    /** Show notification */
    notify?: boolean;
};
