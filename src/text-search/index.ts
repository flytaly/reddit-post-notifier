import { normalize as normalizeDefault, separator, stemmer as stemmerDefault } from './search-helpers';

type StringProcessor = (str: string) => string;

interface IndexOpts {
    normalize?: StringProcessor;
    stemmer?: StringProcessor | null | false;
}

export class Index {
    normalize: StringProcessor;
    separator: string | RegExp = separator;
    stemmer?: StringProcessor | null | false;
    /** Map token to array of ids */
    map: Record<string, (string | number)[]>;

    constructor(opts: IndexOpts = {}) {
        this.normalize = opts.normalize || normalizeDefault;
        this.stemmer = opts.stemmer === undefined ? stemmerDefault : opts.stemmer;
        this.map = {};
    }

    add(id: number | string, str: string) {
        if (!str || !id) return;
        const tokens = this.tokenizer(str);
        if (!tokens.length) return;

        const duplicates = {};
        let token = '';
        for (let i = 0; i < tokens.length; i++) {
            token = this.stemmer ? this.stemmer(tokens[i]) : tokens[i];
            if (!token || duplicates[token]) continue;
            duplicates[token] = 1;

            if (!this.map[token]) this.map[token] = [];
            this.map[token].push(id);
        }
    }

    /** @returns tokens -  array of tokens */
    tokenizer(str: string): string[] {
        const norm = this.normalize(str);
        return norm.split(this.separator);
    }

    search(query: string) {
        // TODO:
    }
}
