import storage from '@/storage';
import { browser } from 'webextension-polyfill-ts';

export const notificationSoundFiles = {
    sound_00: '/audio/234524__foolboymedia__notification-up-1.webm',
    sound_01: '/audio/234523__foolboymedia__notification-up-2.webm',
    sound_02: '/audio/235911__yourfriendjesse__notification-sound.webm',
    sound_03: '/audio/415763__thebuilder15__doorbell-notification.webm',
    sound_04: '/audio/512136__beezlefm__notification-sound.webm',
};

export type SoundId = keyof typeof notificationSoundFiles | 'custom';

export const getAudioSrc = async (soundId: SoundId | undefined | null): Promise<string> => {
    if (!soundId) return '';
    if (soundId === 'custom') {
        const file = await storage.getAudioFile();
        return file?.dataUrl || '';
    }
    const file: string = notificationSoundFiles[soundId];
    if (!file) return '';
    return browser.runtime.getURL(file);
};
