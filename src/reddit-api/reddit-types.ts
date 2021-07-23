export type ImageSource = {
    height?: number;
    width?: number;
    url: string;
};

export type RedditPostData = {
    author: string;
    created_utc: number;
    created: number;
    id: string;
    name: string;
    over_18?: boolean;
    permalink: string;
    preview?: {
        images: Array<{
            id: string;
            resolutions?: ImageSource[];
            source?: ImageSource;
        }>;
    };
    selftext?: string;
    subreddit: string;
    title: string;
    url: string;
};

export type RedditMessageData = {
    associated_awarding_id: null;
    author: string;
    author_fullname: string;
    body: string;
    context: string;
    created: number;
    created_utc: number;
    id: string;
    link_title: string;
    name: string;
    subject: string;
    subreddit: string;
    type: string;
};

export type RedditPost = {
    kind?: 'k3';
    data: RedditPostData;
};

export type RedditMessage = {
    kind: 't1';
    data: RedditMessageData;
};

export type RedditPostResponse = RedditPost & {
    data: RedditPostData & Record<string, unknown>;
};

export type RedditMessageResponse = RedditMessage & {
    data: RedditMessageData & Record<string, unknown>;
};

export type RedditListingCommon = {
    /** after / before - only one should be specified. these indicate the fullname of an item in the listing to use as the anchor point of the slice. */
    after?: number;
    /** after / before - only one should be specified. these indicate the fullname of an item in the listing to use as the anchor point of the slice */
    before?: number;
    /**  the maximum number of items to return in this slice of the listing */
    limit?: number;
    /**   the number of items already seen in this listing. on the html site, the builder uses this to determine when to give values for before and after in the response. */
    count?: number;
    /**  optional parameter; if all is passed, filters such as "hide links that I have voted on" will be disabled. */
    show?: 'all';
    /** expand subreddits */
    sr_detail?: boolean;
};
export type RedditSubredditListing = RedditListingCommon;
export type RedditMessageListing = RedditListingCommon & { mark?: boolean };
export type RedditSearchListing = RedditSubredditListing & {
    /**  a string no longer than 5 characters */
    category?: string;
    include_facets?: boolean;
    /** a string no longer than 512 characters */
    q: string;
    restrict_sr?: boolean;
    sort?: 'relevance' | 'hot' | 'top' | 'new' | 'comments';
    t?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
    type?: 'sr' | 'link' | 'user';
};

export type RedditListing = RedditSubredditListing | RedditSearchListing | RedditMessageListing;
