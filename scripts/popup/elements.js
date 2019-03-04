const $ = document.querySelector.bind(document);

let elements = null;

function getElements() {
    if (!elements) {
        elements = {
            mainContainer: $('main'),
            header: $('header'),
            footer: $('footer'),
        };
    }
    return elements;
}

export default getElements;
