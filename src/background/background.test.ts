/* eslint-disable @typescript-eslint/unbound-method */
import { mocked } from 'jest-mock';
import DEFAULT_OPTIONS from '../options-default';
import { initializeBgListener, onMessage } from '../port';
import type { MessageListener } from '../port';
import storage from '../storage';
import type { ExtensionOptions } from '../types/extension-options';
import type { PortMessageId } from '../types/message';
import { startExtension } from './background';
import { addNotificationClickListener } from '@/notifier/notifications';
import { scheduleNextUpdate, watchAlarms } from './timers';
import { updateAndSchedule } from './update';

jest.mock('../storage/storage.ts');
jest.mock('../port.ts');
jest.mock('@/notifier/notifications');
jest.mock('./timers.ts');
jest.mock('./update.ts');

describe('Start extension', () => {
    const onMessageMock = mocked(onMessage);
    test('should initialize extension', async () => {
        const opts: Partial<ExtensionOptions> = { updateInterval: 300 };
        (storage.getOptions as jest.Mock).mockImplementationOnce(async () => opts);
        mockBrowser.action.setBadgeBackgroundColor.expect({ color: 'darkred' });
        mockBrowser.storage.onChanged.addListener.spy(() => ({}));
        const msgCallbacks = new Map<PortMessageId, MessageListener>();
        mocked(onMessageMock).mockImplementation((id, cb) => msgCallbacks.set(id, cb));

        mockBrowser.runtime.onInstalled.addListener.mock((listener) => {
            listener({ reason: 'update', previousVersion: '3.2', temporary: false });
        });

        mockBrowser.runtime.onStartup.addListener.mock(() => {});
        await startExtension();

        expect(storage.getOptions).toHaveBeenCalled();
        const exp = expect.objectContaining({ ...DEFAULT_OPTIONS, ...opts });
        expect(storage.saveOptions).toHaveBeenCalledWith(exp);

        // onInstall
        expect(storage.migrateToV4).toHaveBeenCalled();

        expect(addNotificationClickListener).toHaveBeenCalled();
        expect(storage.countNumberOfUnreadItems).toHaveBeenCalled();
        expect(initializeBgListener).toHaveBeenCalled();
        expect(watchAlarms).toHaveBeenCalled();
        expect(updateAndSchedule).toHaveBeenCalled();
        expect(mocked(updateAndSchedule).mock.calls.flat(1)).toHaveLength(0);

        jest.clearAllMocks();

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
