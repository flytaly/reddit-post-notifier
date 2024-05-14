export interface ImageSource {
    height?: number;
    width?: number;
    url: string;
}

export type LiteralUnion<LiteralType, BaseType> = LiteralType | (BaseType & Record<never, never>);

export interface MediaMedataPreview {
    /** width */
    x: number;
    /** height */
    y: number;
    /** url */
    u: string;
}

export interface MediaMetadata {
    status: LiteralUnion<'valid', string>;
    id: string;
    e: LiteralUnion<'Image' | 'RedditVideo' | 'AnimatedImage', string>;
    /** image/gif, image/png .... */
    m?: string;
    p?: MediaMedataPreview[];
}

export interface RedditPostData {
    author: string;
    created_utc: number;
    created: number;
    id: string;
    link_flair_text?: string | null;
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
    is_gallery?: boolean;
    media_metadata?: Record<string, MediaMetadata>;
}

export interface RedditCommentData {
    author: string;
    author_fullname: string;
    author_is_blocked: boolean;
    body: string;
    body_html: string;
    created: number;
    created_utc: number;
    id: string;
    link_id: string;
    link_permalink: string;
    link_title: string;
    name: string;
    over_18: boolean;
    permalink: string;
    subreddit: string;
}

export interface RedditMessageData {
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
}

export interface RedditAccountData {
    id: string;
    icon_img: string;
    total_karma: number;
    inbox_count: number;
    has_mail: boolean;
    name: string;
    created_utc: number;
    comment_karma: number;
}

// https://www.reddit.com/dev/api/
export enum RedditObjectKind {
    comment = 't1',
    account = 't2',
    link = 't3',
    message = 't4',
    subreddit = 't5',
    award = 't6',
}

export interface RedditPost {
    kind?: RedditObjectKind.link;
    data: RedditPostData;
}

export type RedditPostExtended = RedditPost & {
    data: RedditPostData & Record<string, unknown>;
};

export interface RedditComment {
    kind?: RedditObjectKind.comment;
    data: RedditCommentData;
}

export interface RedditMessage {
    kind?: RedditObjectKind.message;
    data: RedditMessageData;
}

export interface RedditAccount {
    kind?: RedditObjectKind.account;
    data: RedditAccountData;
}

export type RedditItem = RedditPost | RedditComment;

export interface RedditListingResponse<T> {
    kind: 'Listing';
    data: {
        after?: string | null;
        before?: string | null;
        children: T[];
        dist?: number;
        geo_filter?: string;
        modhash?: string | null;
    };
}

export interface RedditError {
    error?: number;
    message?: string;
    reason?: string;
}

export type RedditMessageResponse = RedditListingResponse<RedditMessage>;
export type RedditPostResponse = RedditListingResponse<RedditPostExtended>;
export type RedditCommentResponse = RedditListingResponse<RedditComment>;
export type RedditUserOverviewResponse = RedditListingResponse<RedditComment | RedditPostExtended>;

export interface RedditListingCommon {
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
}

export type RedditSubredditListing = RedditListingCommon;
export type RedditUserListing = RedditListingCommon & {
    /** an integer between 2 and 10 */
    context?: number;
    sort?: 'hot' | 'new' | 'top' | 'controversial';
    t?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
    type?: 'link' | 'comments';
    /** the name of an existing user */
    username?: string;
};
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
