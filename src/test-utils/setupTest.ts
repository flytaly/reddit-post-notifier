import type { Browser } from 'webextension-polyfill-ts';
import { deepMock } from 'mockzilla';
import type { MockzillaDeep } from 'mockzilla';
import { enableFetchMocks } from 'jest-fetch-mock';
import '@testing-library/jest-dom';

enableFetchMocks();

process.env.TARGET = 'chrome';
process.env.CHROME_CLIENT_ID = 'CHROME_CLIENT_ID';
process.env.CHROME_CLIENT_SECRET = '';
process.env.CHROME_REDIRECT_URI = 'https://test.chromiumapp.org/';
process.env.CHROME_USER_AGENT = 'test_agent';

const [browser, mockBrowser, mockBrowserNode] = deepMock<Browser>('browser', false);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).mockBrowser = mockBrowser;

jest.mock('webextension-polyfill-ts', () => ({ browser }));

beforeEach(() => mockBrowserNode.enable());

afterEach(() => mockBrowserNode.verifyAndDisable());

declare global {
    export const mockBrowser: MockzillaDeep<Browser>;
}
