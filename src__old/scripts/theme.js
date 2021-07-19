/* eslint-disable no-unused-expressions */
import storage from './storage';

let listenerAdded = false;
const themeToClassMap = {
    dark: 'dark-mode',
    purple: 'shades-of-purple',
};

const setClasses = (theme) => {
    const add = themeToClassMap[theme];
    const remove = Object.keys(themeToClassMap)
        .filter((t) => t !== theme)
        .map((t) => themeToClassMap[t]);

    document.body.classList.remove(...remove);
    if (add) document.body.classList.add(add);
};

const setIcons = (isDark) => {
    if (isDark) {
        browser.browserAction.setIcon({
            path: {
                16: 'images/icon-16-light.png',
                32: 'images/icon-32-light.png',
                64: 'images/icon-64-light.png',
            },
        });
    } else {
        browser.browserAction.setIcon({
            path: {
                16: 'images/icon-16.png',
                32: 'images/icon-32.png',
                64: 'images/icon-64.png',
            },
        });
    }
};

const toggleTheme = (theme, mql) => {
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
    if (TARGET === 'chrome') setIcons(isDark);
};

export default async (theme) => {
    if (!theme) {
        const opts = await storage.getOptions();
        // eslint-disable-next-line no-param-reassign
        theme = opts.theme;
    }
    const preferDarkQuery = '(prefers-color-scheme: dark)';
    const mql = window.matchMedia(preferDarkQuery);
    toggleTheme(theme, mql);
    if (!listenerAdded) {
        mql.addEventListener('change', async (e) => {
            const opts = await storage.getOptions();
            toggleTheme(opts.theme, e);
        });
        listenerAdded = true;
    }
};
