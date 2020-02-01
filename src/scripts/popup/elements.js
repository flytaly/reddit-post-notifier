const $ = document.querySelector.bind(document);

let elements = null;

function getElements() {
    if (!elements) {
        elements = {
            mainContainer: $('main'),
            header: $('header'),
            headerBackBtn: $('header button.arrow-left'),
            headerSubredditLink: $('header a.subreddit-name'),
            footer: $('footer'),
            footerBtn: $('footer .footer-button'),
            preview: $('#preview'),
            mail: $('a.mail'),
            options: $('button.options'),
            update: $('button.update'),
        };
    }
    return elements;
}

export default getElements;
