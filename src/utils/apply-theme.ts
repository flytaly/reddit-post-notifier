import browser from 'webextension-polyfill';

import { IS_CHROME } from '@/constants';
import storage from '@/storage';
import type { ExtensionOptions } from '@/types/extension-options';

let listenerAdded = false;

const themeToClassMap: Partial<Record<ExtensionOptions['theme'], string>> = {
    dark: 'dark-theme',
    purple: 'purple-theme',
};

function setClasses(theme: ExtensionOptions['theme']) {
    const toRemove = (Object.keys(themeToClassMap) as Array<keyof typeof themeToClassMap>)
        .filter((t) => t !== theme)
        .map((t) => themeToClassMap[t] as string);
    document.body.classList.remove(...toRemove);

    const toAdd = themeToClassMap[theme];
    if (toAdd) document.body.classList.add(toAdd);
}

export async function setIcons({ isDark }: { isDark: boolean }) {
    const iconPaths = isDark
        ? {
              16: '../../images/icon-16-light.png',
              32: '../../images/icon-32-light.png',
              64: '../../images/icon-64-light.png',
          }
        : {
              16: '../../images/icon-16.png',
              32: '../../images/icon-32.png',
              64: '../../images/icon-64.png',
          };
    return browser.action.setIcon({ path: iconPaths });
}

function toggleTheme(theme: ExtensionOptions['theme'], mql: MediaQueryList | MediaQueryListEvent) {
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

    if (IS_CHROME) {
        void setIcons({ isDark });
        void storage.saveOptions({ iconTheme: isDark ? 'dark' : 'light' });
    }
}

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
