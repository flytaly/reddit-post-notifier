import type { RedditPostData } from '../reddit-api/reddit-types';
import type { DocField } from './document';
import { Document } from './document';
import type { TextId } from './index';

export type SearchableField = keyof Pick<RedditPostData, 'author' | 'title' | 'selftext' | 'link_flair_text'>;
export type SearchableRedditPostData = Pick<RedditPostData, SearchableField> & { id: string | number };
export interface SearchableRedditPost {
    data: SearchableRedditPostData;
}

export interface FilterField { field: SearchableField; query: string; queryType?: 'negative' | 'positive' };
export type FilterRule = FilterField[];

export const allFields: SearchableField[] = ['title', 'selftext', 'author', 'link_flair_text'];

function getPositives(rule: FilterRule) {
    return rule.filter((r) => {
        if (!r.query)
            return false;
        return (!r.queryType || r.queryType === 'positive');
    });
}

function getNegatives(rule: FilterRule) {
    return rule.filter((r) => {
        if (!r.query)
            return false;
        return r.queryType === 'negative';
    });
}

//* * Filter out posts that don't fit given search queries */
export function postFilter<T extends SearchableRedditPost>(
    posts: T[],
    queriesLists: FilterRule[],
    fields: SearchableField[] = allFields,
): T[] {
    const usedFields = fields.map((field) => {
        const result: DocField = { field };

        // match author field without any modifications
        if (field === 'author')
            result.options = { normalize: false, stemmer: false, tokenizer: false };
        // disable stemming for flair
        if (field === 'link_flair_text')
            result.options = { stemmer: false };
        return result;
    });

    const doc = new Document({ fields: usedFields, id: 'id' });
    posts.forEach(p => doc.add(p.data));
    const idList = posts.map(p => p.data.id);

    const result = new Set<TextId>();

    for (let i = 0; i < queriesLists.length; i++) {
        const qList = queriesLists[i];
        if (!qList)
            continue;

        const positiveRules = getPositives(qList);
        const filteredIDs = positiveRules?.length
            ? doc.search(getPositives(qList))
            : idList;

        const excludeIDs = getNegatives(qList).flatMap(r => doc.search([r]));

        filteredIDs.forEach((id) => {
            if (!excludeIDs.includes(id))
                return result.add(id);
        });
    }
    return posts.filter(p => result.has(p.data.id));
}
