import { browser } from 'webextension-polyfill-ts';
import { IS_CHROME } from '../constants';
import storage from '../storage';
import type { ExtensionOptions } from '../types/extension-options';

let listenerAdded = false;

const themeToClassMap = {
    dark: 'dark-theme',
    purple: 'purple-theme',
} as const;

const setClasses = (theme: ExtensionOptions['theme']) => {
    const add = themeToClassMap[theme] as string | undefined;

    const remove: string[] = Object.keys(themeToClassMap)
        .filter((t) => t !== theme)
        .map((t) => themeToClassMap[t as 'dark' | 'purple']);

    document.body.classList.remove(...remove);
    if (add) document.body.classList.add(add);
};

const setIcons = (isDark: boolean) => {
    if (isDark) {
        void browser.browserAction.setIcon({
            path: {
                16: '../../images/icon-16-light.png',
                32: '../../images/icon-32-light.png',
                64: '../../images/icon-64-light.png',
            },
        });
    } else {
        void browser.browserAction.setIcon({
            path: {
                16: '../../images/icon-16.png',
                32: '../../images/icon-32.png',
                64: '../../images/icon-64.png',
            },
        });
    }
};

const toggleTheme = (theme: ExtensionOptions['theme'], mql: MediaQueryList | MediaQueryListEvent) => {
    let isDark = false;
    switch (theme) {
        case 'light':
            isDark = false;
            break;
        case 'purple':
        case 'dark':
            isDark = true;
            break;
        default:
            isDark = mql.matches;
            // eslint-disable-next-line no-param-reassign
            theme = isDark ? 'dark' : 'light';
    }
    setClasses(theme);
    if (IS_CHROME) setIcons(isDark);
};

async function applyTheme(theme?: ExtensionOptions['theme']) {
    if (!theme) {
        const opts = await storage.getOptions();
        theme = opts.theme;
    }
    const preferDarkQuery = '(prefers-color-scheme: dark)';
    const mql = window.matchMedia(preferDarkQuery);
    toggleTheme(theme, mql);
    if (!listenerAdded) {
        mql.addEventListener('change', (e) => void storage.getOptions().then((opts) => toggleTheme(opts.theme, e)));
        listenerAdded = true;
    }
}

export default applyTheme;
