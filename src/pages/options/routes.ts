import getMsg from '../../utils/get-message';

export type PageId = 'settings' | 'info';

export const sections = {
    settings: {
        general: {
            id: 'general',
            name: getMsg('optionsNavGeneral'),
        },
        mail: {
            id: 'mail',
            name: getMsg('optionsNavMail'),
        },
        subreddit: {
            id: 'subreddit',
            name: getMsg('optionsNavSubreddits'),
        },
        'reddit-search': {
            id: 'reddit-search',
            name: getMsg('optionsNavSearch'),
        },
        'follow-user': {
            id: 'follow-user',
            name: getMsg('optionsNavUsers'),
        },
    },
    info: {
        help: {
            id: 'help',
            name: getMsg('optionsNavHelp'),
        },
        shortcuts: {
            id: 'shortcuts',
            name: getMsg('optionsNavShortcuts'),
        },
    },
} as const;
