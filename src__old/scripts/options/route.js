import { getMsg } from '../utils';

export const hashToPage = {
    '#settings': 'settings',
    '#general': 'settings',
    '#mail': 'settings',
    '#subreddits': 'settings',
    '#reddit-search': 'settings',
    '#info': 'info',
    '#how-to-use': 'info',
    '#shortcuts': 'info',
};

export const routes = {
    settings: {
        id: 'settings',
        name: getMsg('optionsNavSettings'),
        sections: {
            general: {
                id: 'general',
                name: getMsg('optionsNavGeneral'),
            },
            mail: {
                id: 'mail',
                name: getMsg('optionsNavMail'),
            },
            subreddit: {
                id: 'subreddits',
                name: getMsg('optionsNavSubreddits'),
            },
            'reddit-search': {
                id: 'reddit-search',
                name: getMsg('optionsNavSearch'),
            },
        },
    },
    info: {
        id: 'info',
        name: getMsg('optionsNavInfo'),
        sections: {
            'how-to-use': {
                id: 'how-to-use',
                name: getMsg('optionsNavHowToUse'),
            },
            shortcuts: {
                id: 'shortcuts',
                name: getMsg('optionsNavShortcuts'),
            },
        },
    },
};
