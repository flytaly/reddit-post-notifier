import {
    intersect,
    normalize as normalizeDefault,
    tokenizer as tokenizerDefault,
    stemmer as stemmerDefault,
} from './search-helpers';

type StringProcessor = (str: string) => string;
export type TextId = string | number;

export interface IndexOpts {
    normalize?: StringProcessor | false;
    stemmer?: StringProcessor | false;
    tokenizer?: ((str: string) => string[]) | false;
}

/** Create index of words in the given text and search  */
export class Index {
    normalize?: StringProcessor | false;
    stemmer?: StringProcessor | false;
    tokenizer?: ((str: string) => string[]) | false;
    /** Map token to array of ids */
    map: Record<string, TextId[]>;

    constructor(opts: IndexOpts = {}) {
        this.normalize = opts.normalize ?? normalizeDefault;
        this.stemmer = opts.stemmer ?? stemmerDefault;
        this.tokenizer = opts.tokenizer ?? tokenizerDefault;
        this.map = {};
    }

    add(id: TextId, str: string) {
        if (!str || !id) return;
        const tokens = this.getTokens(str);
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

    getTokens(str: string): string[] {
        str = this.normalize ? this.normalize(str) : str;
        return this.tokenizer ? this.tokenizer(str) : [str];
    }

    search(query: string): TextId[] {
        if (!query) return [];
        const queryTokens = this.getTokens(query);
        const result: TextId[][] = [];
        for (let i = 0; i < queryTokens.length; i++) {
            const token = this.stemmer ? this.stemmer(queryTokens[i]) : queryTokens[i];
            result.push(this.map[token] || []);
        }
        return intersect(result);
    }
}
