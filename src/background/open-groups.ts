import type { OpenGroupsPayload } from '@/types/message';
import { removePostsFromGroup } from '@/utils/post-group';
import browser from 'webextension-polyfill';

export async function openGroups({ groups, remove }: OpenGroupsPayload = { groups: [], remove: false }) {
    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        if (remove) {
            await removePostsFromGroup(group.id, group.type);
        }
        await browser.tabs.create({ url: group.href, active: i === 0 });
    }
}
