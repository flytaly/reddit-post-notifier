if (TARGET === 'chrome') {
    // chrome doesn't open links by default
    window.addEventListener('click', async (e) => {
        const aElem = e.target.closest('a'); // target could be svg
        if (aElem && aElem.href) {
            await browser.tabs.create({ url: aElem.href, active: true });
        }
    });
}
