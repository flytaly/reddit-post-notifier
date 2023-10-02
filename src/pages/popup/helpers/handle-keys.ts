import { IS_FIREFOX } from '@/constants';

const focusNextRowElement = (current: HTMLElement, reverse = false) => {
    const rows: NodeListOf<HTMLElement> = document.body.querySelectorAll(`
    [data-keys-target="list-row"],
    [data-keys-target="post-row"]
    `);
    if (!rows) return;
    const { length } = rows;
    let index = reverse ? length : -1;
    for (let i = 0; i < length; i += 1) {
        if (rows[i] === current) {
            index = i;
            break;
        }
    }

    index = reverse ? (index || length) - 1 : (index + 1) % length;

    rows[index].focus();
};

const focusNextRowInGroup = (target: HTMLElement) => {
    const li = target.closest('li');
    if (!li) return;

    let row: HTMLElement | null = null;
    if (li.nextElementSibling) {
        row = li.nextElementSibling.firstElementChild as HTMLElement;
    } else if (li.previousElementSibling) {
        row = li.previousElementSibling.firstElementChild as HTMLElement;
    }

    if (row && isPostRow(row)) row.focus();
};

const getGroupHeader = (elem: HTMLElement) => {
    const container = elem.closest('[data-keys-target="list-container"]');
    const header: HTMLElement | null = container?.querySelector('[data-keys-target="list-row"]') || null;
    if (header?.dataset.keysTarget === 'list-row') return header;
};

const isRow = (elem: HTMLElement) => ['list-row', 'post-row'].includes(elem.dataset.keysTarget || '');
const isPostRow = (elem: HTMLElement) => elem.dataset.keysTarget === 'post-row';
const isHeaderRow = (elem: HTMLElement) => elem.dataset.keysTarget === 'list-row';

/**
 * @param {KeyboardEvent} e
 */
export default function handleKeydownEvent(e: KeyboardEvent) {
    const { key, code } = e;
    const target = e.target as HTMLElement;

    // Prevent scrolling by arrow key and other potential default behavior
    if ([' ', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Backspace'].includes(key)) e.preventDefault();

    // Select next element in the list
    if (key === 'ArrowDown' || code === 'KeyJ') {
        focusNextRowElement(target);
    }

    // Select previous element in the list
    if (key === 'ArrowUp' || code === 'KeyK') {
        focusNextRowElement(target, true);
    }

    // Open selected group of posts or open selected post
    if (key === 'ArrowRight' || key === 'Enter' || code === 'KeyL') {
        if (isHeaderRow(target)) return target.click();
        if (isPostRow(target)) {
            const link: HTMLElement | null = target.querySelector('a[data-keys-target="post-link"]');
            link?.click();
            if (IS_FIREFOX) {
                // close window shortly after the click because the extension will lose focus in firefox anyway
                setTimeout(() => window.close(), 30);
            }
        }
    }

    // Collapse group
    if (key === 'ArrowLeft' || key === 'Backspace' || code === 'KeyH') {
        if (isHeaderRow(target)) return target.click();
        if (isPostRow(target)) {
            const groupHeader = getGroupHeader(target);
            groupHeader?.click();
            groupHeader?.focus();
        }
    }

    // Mark selected post or subreddit as read
    if (code === 'Space') {
        if (!isRow(target)) return;
        const button: HTMLElement | null = target.querySelector('[data-keys-target="check-mark"] button');
        if (!button) return;
        focusNextRowInGroup(target);
        button.click();
    }

    if (code === 'KeyP') {
        if (isPostRow(target)) {
            const btn: HTMLElement | null = target.querySelector('[data-keys-target="pin-post"] button');
            if (!btn) return;
            focusNextRowInGroup(target);
            btn.click();
        }
    }
}
