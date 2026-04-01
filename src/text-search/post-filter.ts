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
            result.options = { normalize: false, stemmer: false, tokenizer: false, queryTokenizer: false };
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

        // Separate regex queries (e.g. /pattern/i) from standard ones
        const regexRules = qList.filter(r => r.query && /^\/.+\/[gimsuy]*$/.test(r.query));
        const standardRules = qList.filter(r => r.query && !/^\/.+\/[gimsuy]*$/.test(r.query));

        // Process standard text filters via the built-in Document index
        const positiveRules = getPositives(standardRules);
        let filteredIDs = positiveRules.length
            ? doc.search(positiveRules)
            : idList;

        const excludeIDs = getNegatives(standardRules).flatMap(r => doc.search([r]));
        filteredIDs = filteredIDs.filter(id => !excludeIDs.includes(id));

        // Apply custom Regex rules manually for precise phrase/order matching
        filteredIDs.forEach((id) => {
            const post = posts.find(p => p.data.id === id);
            if (!post) return;

            let passesRegex = true;
            for (const rule of regexRules) {
                const match = rule.query.match(/^\/(.+)\/([gimsuy]*)$/);
                if (match) {
                    try {
                        const regex = new RegExp(match[1], match[2] || 'i');
                        const isMatch = regex.test(post.data[rule.field] || '');
                        
                        if (rule.queryType === 'negative' && isMatch) passesRegex = false;
                        if (rule.queryType !== 'negative' && !isMatch) passesRegex = false;
                    } catch (e) {
                        console.error('Invalid Regex', rule.query);
                    }
                }
            }

            if (passesRegex) {
                result.add(id);
            }
        });
    }
    return posts.filter(p => result.has(p.data.id));
}
