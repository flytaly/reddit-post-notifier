import { extractPostGroups, removePostsFromGroup } from '@/pages/popup/helpers/post-group';
import storage from '@/storage';
import { browser } from 'webextension-polyfill-ts';

const clickHandler = () => {
    void storage
        .getAllData()
        .then(async (data) => {
            const { groupsWithPosts } = extractPostGroups(data);
            for (let i = 0; i < groupsWithPosts.length; i++) {
                const g = groupsWithPosts[i];
                await browser.tabs.create({ url: g.href, active: i == 0 });
                await removePostsFromGroup(g.id, g.type);
            }
        })
        .catch(console.error);
};

export async function setPopup(disablePopup = false) {
    if (disablePopup) {
        await browser.browserAction.setPopup({ popup: '' });
        if (!browser.browserAction.onClicked.hasListeners()) {
            browser.browserAction.onClicked.addListener(clickHandler);
        }
        return;
    }

    await browser.browserAction.setPopup({ popup: browser.runtime.getURL('dist/popup/index.html') });
}
