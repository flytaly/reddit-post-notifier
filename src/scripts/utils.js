/* eslint-disable import/prefer-default-export */
export const mapObjToQueryStr = (params) => Object.entries(params).map((pair) => pair.join('=')).join('&');

export const wait = (ms = 5000) => new Promise((resolve) => setTimeout(resolve, ms));

export const generateId = () => (Date.now() + crypto.getRandomValues(new Uint32Array(1))[0]).toString(36);

export const getSubredditUrl = (subreddit) => `https://reddit.com/r/${subreddit}/new`;

export const getSearchQueryUrl = (query, subreddit = '') => {
    const endpoint = subreddit
        ? `/r/${subreddit}/search?sort=new&restrict_sr=on&q=${query}`
        : `/search?q=${query}&sort=new`;

    return `https://reddit.com${endpoint}`;
};
