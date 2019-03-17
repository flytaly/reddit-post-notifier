import { translateElement } from '../l10n';

const $ = document.querySelector.bind(document);

const translateTemplate = ({ content }) => {
    translateElement(content);
    return content;
};

let templates = null;

function getTemplates() {
    if (!templates) {
        templates = {
            queryList: translateTemplate($('#query-list-tmp')),
            queryListRow: translateTemplate($('#query-list-row-tmp')),
            postList: translateTemplate($('#post-list-tmp')),
            postListRow: translateTemplate($('#post-list-row-tmp')),
            noPosts: translateTemplate($('#no-posts')),
        };
    }
    return templates;
}

export default getTemplates;
