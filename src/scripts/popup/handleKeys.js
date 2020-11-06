const focusFirstListElement = (container = document) => {
    const list = container.querySelector('[data-keys-target="list"]');
    if (list) list.firstElementChild.focus();
};

const focusLastListElement = (container = document) => {
    const list = container.querySelector('[data-keys-target="list"]');
    if (list) list.lastElementChild.focus();
};

const getContainer = (elem) => elem.closest('[data-keys-target="list-container"]');

const getNextRowElement = (elem, backward = false) => {
    let next = backward ? elem.previousElementSibling : elem.nextElementSibling;
    if (!next) {
        if (elem.dataset.keysTarget === 'post-row') {
            next = getNextRowElement(getContainer(elem), backward);
        } else {
            next = backward ? elem.parentElement.lastElementChild : elem.parentElement.firstElementChild;
        }
    }
    return next;
};

const isRow = (elem) => ['list-row', 'post-row'].includes(elem.dataset.keysTarget);
const isRowContainer = (elem) => elem.dataset.keysTarget === 'list-container';
const isPostRow = (elem) => elem.dataset.keysTarget === 'post-row';
const isHeaderRow = (elem) => elem.dataset.keysTarget === 'list-row';

/**
 * @param {KeyboardEvent} e
 */
export default async function handleKeydownEvent(e) {
    const { target, key, code } = e;

    // Prevent scrolling by arrow key and other potential default behavior
    if ([' ', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Backspace'].includes(key)) e.preventDefault();

    // Select next element in the list
    if (key === 'ArrowDown' || code === 'KeyJ') {
        if (!isRow(target)) {
            return focusFirstListElement();
        }
        const next = getNextRowElement(target);
        if (isRow(next)) {
            next.focus();
        } else if (isRowContainer(next)) focusFirstListElement(next);
    }

    // Select previous element in the list
    if (key === 'ArrowUp' || code === 'KeyK') {
        if (!isRow(target)) {
            return focusLastListElement();
        }
        const next = getNextRowElement(target, true);
        if (isRow(next)) {
            next.focus();
        } else if (isRowContainer(next)) focusLastListElement(next);
    }

    // Open selected group of posts or open selected post
    if (key === 'ArrowRight' || key === 'Enter' || code === 'KeyL') {
        if (isHeaderRow(target)) return target.click();
        if (isPostRow(target)) {
            const link = target.querySelector(`a[data-id="${target.dataset.id}"]`);
            link?.click();
            if (TARGET === 'firefox') {
                // close window shortly after the click because the extension will lose focus in firefox anyway
                setTimeout(() => window.close(), 30);
            }
        }
    }

    // Collapse group
    if (key === 'ArrowLeft' || key === 'Backspace' || code === 'KeyH') {
        if (isHeaderRow(target)) return target.click();
        if (isPostRow(target)) {
            const groupHeader = getContainer(target)?.previousElementSibling;
            if (groupHeader && groupHeader.dataset.keysTarget === 'list-row') {
                groupHeader.click();
                groupHeader.focus();
            }
        }
    }

    // Mark selected post or subreddit as read
    if (code === 'Space') {
        if (!isRow(target)) return;
        const next = target.nextElementSibling;
        const prev = target.previousElementSibling;
        const button = target.querySelector('[data-keys-target="check-mark"] button');
        button?.click();
        if (isPostRow(target)) {
            if (next) next.focus();
            else prev?.focus();
        }
    }
}
