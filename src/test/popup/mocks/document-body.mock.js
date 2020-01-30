import { JSDOM } from 'jsdom';
import html from '../../../common/popup.html';

const dom = new JSDOM(html);
window.document.body.innerHTML = dom.window.document.body.innerHTML;

export default dom;
