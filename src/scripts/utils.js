/* eslint-disable import/prefer-default-export */
export const mapObjToQueryStr = (params) =>
    Object.entries(params)
        .map((pair) => pair.join('='))
        .join('&');

export const wait = (ms = 5000) => new Promise((resolve) => setTimeout(resolve, ms));

export const $ = document.querySelector.bind(document);

export const subredditNameRegExp = /^[A-Za-z0-9]\w{1,20}$/;

export const generateId = () => (Date.now() + crypto.getRandomValues(new Uint32Array(1))[0]).toString(36);

export const getSubredditUrl = (subreddit) => `https://reddit.com/r/${subreddit}/new`;

export const getSearchQueryUrl = (query, subreddit = '') => {
    const endpoint = subreddit
        ? `/r/${subreddit}/search?sort=new&restrict_sr=on&q=${query}`
        : `/search?q=${query}&sort=new`;

    return `https://reddit.com${endpoint}`;
};

export const debounce = (func, waitMs) => {
    let waiting = false;
    let tmId;
    return (...args) => {
        if (waiting) clearTimeout(tmId);
        waiting = true;
        tmId = setTimeout(() => {
            func(...args);
            waiting = false;
        }, waitMs);
    };
};
