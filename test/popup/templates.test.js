import { JSDOM } from 'jsdom';
import getTemplates from '../../scripts/popup/templates';
import html from '../../extension/popup.html';

beforeAll(() => {
    window.document.body.innerHTML = new JSDOM(html).window.document.body.innerHTML;
});

describe('templates', () => {
    test('should match snapshot', () => {
        expect(getTemplates()).toMatchSnapshot();
    });
});
