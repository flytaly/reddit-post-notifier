import type { RedditListingResponse, RedditMessage, RedditPost } from '../reddit-types';

const response: RedditListingResponse<RedditPost | RedditMessage> = {
    kind: 'Listing',
    data: { children: [] },
};

export const mockUnread = jest.fn(async () => response);
export const mockNewPosts = jest.fn(async () => response);
export const mockNewSearchPosts = jest.fn(async () => response);
export const mockSearch = jest.fn(async () => response);
export const mockGetSub = jest.fn(() => ({ new: mockNewPosts, search: mockNewSearchPosts }));

const mock = jest.fn().mockImplementation(() => {
    return {
        getSubreddit: mockGetSub,
        search: mockSearch,
        messages: {
            unread: mockUnread,
        },
    };
});

export default mock;
