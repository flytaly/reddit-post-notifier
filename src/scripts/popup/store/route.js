import { writable } from 'svelte/store';

export const ROUTES = {
    WATCH_LIST: 'WATCH_LIST',
    SUBREDDIT_POSTS_LIST: 'SUBREDDIT_POSTS_LIST',
    SEARCH_POSTS_LIST: 'SEARCH_POSTS_LIST',
};

const defaultState = {
    route: ROUTES.WATCH_LIST,
    id: null,
};

export const route = writable(defaultState);
