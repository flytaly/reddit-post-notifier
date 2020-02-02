/* eslint-disable global-require */
import './mocks/document-body.mock';
import './mocks/storage.mock';
import './mocks/browser.mock';
import './mocks/match-media.mock';
import { wait } from '@testing-library/dom';
import nav from './mocks/navigation.mock';
import getElements from '../../scripts/popup/elements';
import { connect } from './mocks/messages.mock';

describe('', () => {
    beforeAll(() => {
        require('../../scripts/popup/popup');
        window.document.dispatchEvent(new Event('DOMContentLoaded'));
    });

    test('should call the connect that establishes a connection with the extension process', async () => {
        await wait(() => expect(connect).toHaveBeenCalledWith(nav));
    });

    test('should navigate after DOM Content Loaded', async () => {
        await wait(() => expect(nav.navigate).toHaveBeenCalledWith(nav.locations.queriesList));
    });

    test('should have added click listener to button', () => {
        const { headerBackBtn } = getElements();
        headerBackBtn.dispatchEvent(new MouseEvent('click'));
        expect(nav.navigate).toHaveBeenCalledWith(nav.locations.queriesList, { forceUpdate: true });
    });

    test('should apply theme', () => {
        expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });
});
