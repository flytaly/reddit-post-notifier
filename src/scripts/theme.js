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
    } else {
        document.body.classList.remove(className);
    }
};

export default async () => {
    const { theme } = await storage.getOptions();
    const preferDarkQuery = '(prefers-color-scheme: dark)';
    const mql = window.matchMedia(preferDarkQuery);
    toggleTheme(theme, mql);
    if (!listenerAdded) {
        mql.addEventListener('change', async (e) => {
            // eslint-disable-next-line no-shadow
            const { theme } = await storage.getOptions();
            toggleTheme(theme, e);
        });
        listenerAdded = true;
    }
};
