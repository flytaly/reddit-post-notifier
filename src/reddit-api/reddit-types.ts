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
    author: string;
    author_fullname: string;
    body: string;
    body_html: string;
    context?: string;
    created: number;
    created_utc: number;
    dest: string;
    id: string;
    link_title?: string;
    name: string;
    subject: string;
    subreddit?: string;
    type?: string;
    was_comment?: boolean;
};

// https://www.reddit.com/dev/api/
type RedditObjectType = 't1' | 't2' | 't3' | 't4' | 't5' | 't6';

export type RedditPost = {
    kind?: RedditObjectType;
    data: RedditPostData;
};

export type RedditPostExtended = RedditPost & {
    data: RedditPostData & Record<string, unknown>;
};

export type RedditMessage = {
    kind?: RedditObjectType;
    data: RedditMessageData;
};

export type RedditItem = RedditMessage | RedditPost;

export type RedditListingResponse<T> = {
    kind: 'Listing';
    data: {
        after?: string | null;
        before?: string | null;
        children: T[];
        dist?: number;
        geo_filter?: string;
        modhash?: string | null;
    };
};

export type RedditError = {
    error?: number;
    message?: string;
    reason?: string;
};

export type RedditMessageResponse = RedditListingResponse<RedditMessage>;
export type RedditPostResponse = RedditListingResponse<RedditPostExtended>;

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
    restrict_sr?: 'on';
    sort?: 'relevance' | 'hot' | 'top' | 'new' | 'comments';
    t?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
    type?: 'sr' | 'link' | 'user';
};

export type RedditListing = RedditSubredditListing | RedditSearchListing | RedditMessageListing;
