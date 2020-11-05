import { route, ROUTES } from './store/route';

/**
 * @param {KeyboardEvent} e
 */
export default async function handleKeydownEvent(e) {
    const { target, key, code } = e;

    // Prevent scrolling by arrow key and other potential default behavior
    if ([' ', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Backspace'].includes(key)) e.preventDefault();

    // Select next element in the list
    if (key === 'ArrowDown' || code === 'KeyJ') {
        if (target.dataset.keysTarget === 'list-row') {
            const next = target.nextElementSibling ? target.nextElementSibling : target.parentElement.firstElementChild;
            next.focus();
        } else {
            const list = document.querySelector('[data-keys-target="list"]');
            if (list) list.firstElementChild.focus();
        }
    }

    // Select previous element in the list
    if (key === 'ArrowUp' || code === 'KeyK') {
        if (target.dataset.keysTarget === 'list-row') {
            const next = target.previousElementSibling
                ? target.previousElementSibling
                : target.parentElement.lastElementChild;
            next.focus();
        } else {
            const list = document.querySelector('[data-keys-target="list"]');
            if (list) list.lastElementChild.focus();
        }
    }

    // Navigate to the list of posts or open selected post
    if ((key === 'ArrowRight' || key === 'Enter' || code === 'KeyL') && target.dataset.keysTarget === 'list-row') {
        if (target.dataset.keysTarget === 'list-row') {
            const link = target.querySelector(`a[data-id="${target.dataset.id}"]`);
            if (link) {
                link.click();
                if (TARGET === 'firefox') {
                    // close window shortly after the click because the extension will lose focus in firefox anyway
                    setTimeout(() => window.close(), 30);
                }
            } else {
                target.click();
            }
        }
    }

    // Go to the main screen
    if (key === 'ArrowLeft' || key === 'Backspace' || code === 'KeyH') {
        route.set({ route: ROUTES.WATCH_LIST, id: null });
    }

    // Mark selected post or subreddit as read
    if (code === 'Space') {
        if (!target.dataset.keysTarget === 'list-row') return;
        const button = target.querySelector('[data-keys-target="check-mark"] button');
        button?.click();
    }

    // Open subreddit or search
    if (key === 'Enter' && target.dataset.keysTarget !== 'list-row') {
        const a = document.querySelector('a[data-keys-target="header-link"]');
        if (a) {
            a.click();
            setTimeout(() => window.close(), 50);
        }
    }
}
