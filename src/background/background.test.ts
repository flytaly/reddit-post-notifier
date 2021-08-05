/* eslint-disable @typescript-eslint/unbound-method */
import { mocked } from 'ts-jest/utils';
import DEFAULT_OPTIONS from '../options-default';
import { initializeBgListener, onMessage } from '../port';
import type { MessageListener } from '../port';
import storage from '../storage';
import type { ExtensionOptions } from '../types/extension-options';
import type { PortMessageId } from '../types/message';
import { startExtension } from './background';
import { addNotificationClickListener } from './notifications';
import { scheduleNextUpdate, watchAlarms } from './timers';
import { updateAndSchedule } from './update';

jest.mock('../storage/storage.ts');
jest.mock('../port.ts');
jest.mock('./notifications.ts');
jest.mock('./timers.ts');
jest.mock('./update.ts');

describe('Start extension', () => {
    const onMessageMock = mocked(onMessage);
    test('should initialize extension', async () => {
        const opts: Partial<ExtensionOptions> = { updateInterval: 300 };
        (storage.getOptions as jest.Mock).mockImplementationOnce(async () => opts);
        mockBrowser.browserAction.setBadgeBackgroundColor.expect({ color: 'darkred' });
        mockBrowser.storage.onChanged.addListener.spy(() => ({}));
        const msgCallbacks = new Map<PortMessageId, MessageListener>();
        mocked(onMessageMock).mockImplementation((id, cb) => msgCallbacks.set(id, cb));

        await startExtension();

        expect(storage.getOptions).toHaveBeenCalled();
        const exp = expect.objectContaining({ ...DEFAULT_OPTIONS, ...opts });
        expect(storage.saveOptions).toHaveBeenCalledWith(exp);

        expect(addNotificationClickListener).toHaveBeenCalled();
        expect(storage.countNumberOfUnreadItems).toHaveBeenCalled();
        expect(initializeBgListener).toHaveBeenCalled();
        expect(watchAlarms).toHaveBeenCalled();
        expect(updateAndSchedule).toHaveBeenCalled();

        jest.clearAllMocks();

        expect(msgCallbacks.size).toBe(2);
        expect(msgCallbacks.has('UPDATE_NOW')).toBeTruthy();
        expect(msgCallbacks.has('SCHEDULE_NEXT_UPDATE')).toBeTruthy();

        await msgCallbacks.get('UPDATE_NOW')();
        expect(updateAndSchedule).toHaveBeenCalled();

        await msgCallbacks.get('SCHEDULE_NEXT_UPDATE')();
        expect(scheduleNextUpdate).toHaveBeenCalled();
    });
});