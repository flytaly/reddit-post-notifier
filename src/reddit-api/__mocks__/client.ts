import type { RedditAccount, RedditComment, RedditListingResponse, RedditMessage, RedditPost } from '../reddit-types';
import { vi } from 'vitest';

const response: RedditListingResponse<RedditPost | RedditMessage | RedditComment> = {
    kind: 'Listing',
    data: { children: [] },
};

export const mockUnread = vi.fn(async () => response);

export const mockNewPosts = vi.fn(async () => response);
export const mockNewSearchPosts = vi.fn(async () => response);
export const mockGetSub = vi.fn(() => ({ new: mockNewPosts, search: mockNewSearchPosts }));

export const mockSearch = vi.fn(async () => response);

const mockUserOverview = vi.fn(async () => response);
const mockUserSubmitted = vi.fn(async () => response);
const mockUserComments = vi.fn(async () => response);
export const mockUser = vi.fn(() => ({
    overview: mockUserOverview,
    comments: mockUserComments,
    submitted: mockUserSubmitted,
}));
const mockSetAccessToken = vi.fn();
const mockMe = vi.fn(
    async () =>
        ({
            kind: 't2',
            data: {},
        }) as RedditAccount,
);

const mock = vi.fn().mockImplementation(() => {
    return {
        getSubreddit: mockGetSub,
        search: mockSearch,
        messages: { unread: mockUnread },
        user: mockUser,
        setAccessToken: mockSetAccessToken,
        me: mockMe,
    };
});

export default mock;
