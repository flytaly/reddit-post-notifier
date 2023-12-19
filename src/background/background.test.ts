/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */

import { listenForMessages, onMessage, type MessageListener } from '@/messaging';
import { addNotificationClickListener } from '@/notifier/notifications';
import DEFAULT_OPTIONS from '@/options-default';
import storage from '@/storage/storage';
import type { ExtensionOptions } from '@/types/extension-options';
import type { PortMessageId } from '@/types/message';
import { describe, expect, test, vi } from 'vitest';
import browser from 'webextension-polyfill';
import { startExtension } from './background';
import { scheduleNextUpdate, watchAlarms } from './timers';
import { updateAndSchedule } from './update';

vi.mock('@/storage/storage.ts');
vi.mock('@/messaging.ts');
vi.mock('@/notifier/notifications');
vi.mock('./timers.ts');
vi.mock('./update.ts');

const { mocked } = vi;

describe('Start extension', () => {
    const onMessageMock = vi.mocked(onMessage);
    test('should initialize extension', async () => {
        const opts: Partial<ExtensionOptions> = { updateInterval: 300, iconTheme: 'dark' };
        mocked(storage.getOptions).mockImplementation(async () => opts as ExtensionOptions);
        mocked(storage.saveOptions).mockImplementation(async () => {});

        const msgCallbacks = new Map<PortMessageId, MessageListener>();
        mocked(onMessageMock).mockImplementation((id, cb) => msgCallbacks.set(id, cb));

        await startExtension();

        // onInstall
        const onInstallCb = vi.mocked(browser.runtime.onInstalled.addListener).mock.calls[0][0];
        onInstallCb({ reason: 'update', previousVersion: '4', temporary: false });
        await new Promise((resolve) => setTimeout(resolve, 10));
        expect(storage.getOptions).toHaveBeenCalled();
        expect(storage.saveOptions).toHaveBeenCalled();
        const args = vi.mocked(storage.saveOptions).mock.calls[0][0];
        expect(args).toMatchObject({ ...DEFAULT_OPTIONS, ...opts });

        expect(addNotificationClickListener).toHaveBeenCalled();
        expect(storage.countNumberOfUnreadItems).toHaveBeenCalled();
        expect(listenForMessages).toHaveBeenCalled();
        expect(watchAlarms).toHaveBeenCalled();
        expect(updateAndSchedule).toHaveBeenCalled();
        expect(mocked(updateAndSchedule).mock.calls.flat(1)).toHaveLength(0);
        expect(browser.runtime.onStartup.addListener).toHaveBeenCalled();

        vi.clearAllMocks();

        expect(msgCallbacks.size).toBe(3);
        expect(msgCallbacks.has('UPDATE_NOW')).toBeTruthy();
        expect(msgCallbacks.has('SCHEDULE_NEXT_UPDATE')).toBeTruthy();
        expect(msgCallbacks.has('OPEN_GROUPS')).toBeTruthy();

        await msgCallbacks.get('UPDATE_NOW')?.();
        expect(updateAndSchedule).toHaveBeenCalledWith(true);

        await msgCallbacks.get('SCHEDULE_NEXT_UPDATE')?.();
        expect(scheduleNextUpdate).toHaveBeenCalled();
    });
});
