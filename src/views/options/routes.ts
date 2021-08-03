import { readable } from 'svelte/store';
import getMsg from '../../utils/get-message';
import Settings from './components/SettingsPage.svelte';
import Info from './components/InfoPage.svelte';

export type PageId = '#settings' | '#info';

export const sections = {
    '#settings': {
        name: getMsg('optionsNavSettings'),
    },
    '#settings__general': {
        name: getMsg('optionsNavGeneral'),
    },
    '#settings__mail': {
        name: getMsg('optionsNavMail'),
    },
    '#settings__subreddit': {
        name: getMsg('optionsNavSubreddits'),
    },
    '#settings__reddit-search': {
        name: getMsg('optionsNavSearch'),
    },
    '#info': {
        name: getMsg('optionsNavInfo'),
    },
    '#info__how-to-use': {
        name: getMsg('optionsNavHowToUse'),
    },
    '#info__shortcuts': {
        name: getMsg('optionsNavShortcuts'),
    },
} as const;

export type SectionKey = keyof typeof sections;

function parseHash() {
    let component: typeof Settings;
    const hash = window.location.hash;

    const sectionId: SectionKey = Object.keys(sections).includes(hash) ? (hash as SectionKey) : '#settings';

    const [p] = sectionId.split('__');
    const page: PageId = p === '#info' ? p : '#settings';

    if (page === '#info') component = Info;
    else component = Settings;

    const title = `Reddit Post Notifier | ${sections[page].name}`;

    return { page, cmp: component, title, sectionId };
}

export const pageInfo = readable(parseHash(), (set) => {
    const update = () => set(parseHash());
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
});
