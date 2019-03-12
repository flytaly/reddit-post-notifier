import { JSDOM } from 'jsdom';
import html from '../../../extension/popup.html';

const dom = new JSDOM(html);
window.document.body.innerHTML = dom.window.document.body.innerHTML;

export default dom;
