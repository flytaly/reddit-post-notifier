import { connect, postMessage } from '../../../scripts/popup/messages';

jest.mock('../../../scripts/popup/messages.js', () => ({
    connect: jest.fn(),
    postMessage: jest.fn(),
}));

export { connect, postMessage };
