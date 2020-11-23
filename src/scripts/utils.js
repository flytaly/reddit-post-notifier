export const mapObjToQueryStr = (params) =>
    Object.entries(params)
        .map((pair) => pair.join('='))
        .join('&');

export const wait = (ms = 5000) => new Promise((resolve) => setTimeout(resolve, ms));

export const $ = document.querySelector.bind(document);

export const subredditNameRegExp = /^[A-Za-z0-9]\w{1,20}$/;

export const baseUrl = 'https://reddit.com';

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

export const getMsg = (msg) => browser.i18n.getMessage(msg);

/** Filter out not needed properties */
export const filterPostDataProperties = (post) => {
    if (!post?.data) return post;
    const filterList = [
        'subreddit',
        'selftext',
        'title',
        'created',
        'created_utc',
        'name',
        'over_18',
        'author',
        'permalink',
        'id',
        'preview',
        'url',
    ];

    const data = filterList.reduce((acc, property) => {
        if (post.data[property]) {
            acc[property] = post.data[property];
        }
        return acc;
    }, {});

    if (data.selftext?.length > 400) {
        data.selftext = data.selftext.slice(0, 400);
    }

    return { ...post, data };
};
