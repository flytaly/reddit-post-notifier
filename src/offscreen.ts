declare let self: ServiceWorkerGlobalScope;
let creating: null | Promise<void> = null;

/** https://developer.chrome.com/docs/extensions/reference/offscreen/#example*/
export async function setupOffscreenDocument(path: string) {
    // Check all windows controlled by the service worker to see if one
    // of them is the offscreen document with the given path
    const offscreenUrl = chrome.runtime.getURL(path);
    const matchedClients = await self.clients.matchAll();
    for (const client of matchedClients) {
        if (client.url === offscreenUrl) {
            return;
        }
    }

    // create offscreen document
    if (creating) {
        await creating;
    } else {
        creating = chrome.offscreen.createDocument({
            url: path,
            reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
            justification: 'play notification sounds',
        });
        await creating;
        creating = null;
    }
}
