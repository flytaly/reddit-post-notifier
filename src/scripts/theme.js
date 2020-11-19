/* eslint-disable no-unused-expressions */
import storage from './storage';

let listenerAdded = false;
const className = 'dark-mode';

const toggleTheme = (theme, mql) => {
    let isDark = false;
    switch (theme) {
        case 'light':
            isDark = false;
            break;
        case 'dark':
            isDark = true;
            break;
        default:
            isDark = mql.matches;
    }
    if (isDark) {
        document.body.classList.add(className);
        if (TARGET === 'chrome') {
            browser.browserAction.setIcon({
                path: {
                    16: 'images/icon-16-light.png',
                    32: 'images/icon-32-light.png',
                    64: 'images/icon-64-light.png',
                },
            });
        }
    } else {
        document.body.classList.remove(className);
        if (TARGET === 'chrome') {
            browser.browserAction.setIcon({
                path: {
                    16: 'images/icon-16.png',
                    32: 'images/icon-32.png',
                    64: 'images/icon-64.png',
                },
            });
        }
    }
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
