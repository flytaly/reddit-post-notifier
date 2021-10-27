// https://www.regular-expressions.info/unicode.html
export const separator = /[\p{Z}\p{S}\p{P}\p{C}$]+/u;

export const tokenizer = (str: string): string[] => str.split(separator);

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

export function intersect<T>(arrays: T[][]): T[] {
    const idsList = arrays[0];
    if (arrays.length < 1) return [];

    const resultIds: T[] = [];

    for (let i = 0; i < idsList.length; i++) {
        const id = idsList[i];
        let count = 1;
        for (let j = 1; j < arrays.length; j++) {
            if (arrays[j].includes(id)) count += 1;
        }
        if (count === arrays.length) {
            resultIds.push(id);
        }
    }

    return resultIds;
}
