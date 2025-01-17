import process from 'node:process';

import { vi } from 'vitest';
import 'vitest-dom/extend-expect';

const chromeObject = { runtime: { id: 'some-test-id-from-test-setup' } };
(globalThis as any).chrome = chromeObject;

process.env.TARGET = 'chrome';
process.env.CHROME_CLIENT_ID = 'CHROME_CLIENT_ID';
process.env.CHROME_CLIENT_SECRET = '';
process.env.CHROME_REDIRECT_URI = 'https://test.chromiumapp.org/';
process.env.CHROME_USER_AGENT = 'test_agent';

vi.mock('webextension-polyfill');

Element.prototype.animate = vi.fn().mockImplementation(() => ({
    finished: Promise.resolve(),
    cancel: vi.fn(),
}));

Element.prototype.getAnimations = vi.fn(() => []);
