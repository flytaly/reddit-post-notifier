import browser from 'webextension-polyfill';
import { IS_CHROME } from '@/constants';

export function openLinksOnClick() {
    if (IS_CHROME) {
        // chrome doesn't open links by default
        window.addEventListener('click', (e) => {
            const aElem = (e.target as HTMLElement).closest('a'); // target could be svg
            if (aElem && aElem.href) {
                void browser.tabs.create({ url: aElem.href, active: true });
            }
        });
    }
}
