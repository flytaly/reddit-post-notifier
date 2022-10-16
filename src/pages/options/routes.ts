import getMsg from '@/utils/get-message';

export const routes = {
    watch: {
        id: 'watch',
        href: './watch.html',
        name: getMsg('optionsNavWatch'),
        sections: {
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
    },
    settings: {
        id: 'settings',
        href: './index.html',
        name: getMsg('optionsNavSettings'),
        sections: {}
    },
    'import-export': {
        id: 'import-export',
        href: './import-export.html',
        name: getMsg('optionsNavImportExport'),
        sections: {},
    },
    info: {
        id: 'info',
        href: './info.html',
        name: getMsg('optionsNavInfo'),
        sections: {
            help: {
                id: 'help',
                name: getMsg('optionsNavHelp'),
            },
            shortcuts: {
                id: 'shortcuts',
                name: getMsg('optionsNavShortcuts'),
            },
        },
    },
} as const;

export type PageId = keyof typeof routes;
