// https://www.regular-expressions.info/unicode.html
export const separator = /[\p{Z}\p{S}\p{P}\p{C}$]+/u;

export const normalize = (str: string) => str.trim().toLowerCase();

export const engStemming = [
    'ance', //
    'ence',
    'ness',
    'able',
    'ible',
    'ment',
    'ful',
    'ent',
    'ism',
    'ed',
    's',
];

export const stemRegExp = new RegExp('(?!\\b)(' + engStemming.join('|') + ')\\b');

export const stemmer = (word: string, minLen = 3) => {
    if (word.length <= minLen) return word;
    return word.replace(stemRegExp, '');
};
