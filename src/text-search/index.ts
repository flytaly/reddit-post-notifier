import {
    intersect,
    normalize as normalizeDefault,
    stemmer as stemmerDefault,
    tokenizer as tokenizerDefault,
    whitespaceTokenizer as whitespaceTokenizerDefault,
} from './search-helpers';

type StringProcessor = (str: string) => string;
export type TextId = string | number;

export interface IndexOpts {
    normalize?: StringProcessor | false;
    stemmer?: StringProcessor | false;
    tokenizer?: ((str: string) => string[]) | false;
    queryTokenizer?: ((str: string) => string[]) | false;
}

/** Create index of words in the given text and search  */
export class Index {
    normalize?: StringProcessor | false;
    stemmer?: StringProcessor | false;
    tokenizer?: ((str: string) => string[]) | false;
    queryTokenizer?: ((str: string) => string[]) | false;
    /** Map token to array of ids */
    map: Record<string, TextId[]>;

    constructor(opts: IndexOpts = {}) {
        this.normalize = opts.normalize ?? normalizeDefault;
        this.stemmer = opts.stemmer ?? stemmerDefault;
        this.tokenizer = opts.tokenizer ?? tokenizerDefault;
        this.queryTokenizer = opts.queryTokenizer ?? whitespaceTokenizerDefault;
        this.map = {};
    }

    add(id: TextId, str: string) {
        if (!str || !id)
            return;
        const tokens = this.getTokens(str);
        if (!tokens.length)
            return;

        const duplicates = {} as Record<string, number>;
        let token = '';
        for (let i = 0; i < tokens.length; i++) {
            token = this.stemmer ? this.stemmer(tokens[i]) : tokens[i];
            if (!token || duplicates[token])
                continue;
            duplicates[token] = 1;

            if (!this.map[token])
                this.map[token] = [];
            this.map[token].push(id);
        }
    }

    getTokens(str: string): string[] {
        str = this.normalize ? this.normalize(str) : str;
        const result: string[] = [];
        if (!this.tokenizer && !this.queryTokenizer) {
            return [str];
        }
        if (this.tokenizer) {
            result.push(...this.tokenizer(str));
        }
        if (this.queryTokenizer) {
            result.push(...this.queryTokenizer(str));
        }
        return result;
    }

    search(query: string): TextId[] {
        if (!query)
            return [];
        query = this.normalize ? this.normalize(query) : query;
        const queryTokens = this.queryTokenizer ? this.queryTokenizer(query) : [query];
        const result: TextId[][] = [];
        for (let i = 0; i < queryTokens.length; i++) {
            const token = this.stemmer ? this.stemmer(queryTokens[i]) : queryTokens[i];
            if (!token)
                continue;
            result.push(this.map[token] || []);
        }
        return intersect(result);
    }
}
