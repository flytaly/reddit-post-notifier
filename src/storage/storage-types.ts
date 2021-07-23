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
