import type { RedditPostData } from '../reddit-api/reddit-types';
import type { DocField, DocSearch } from './document';
import { Document } from './document';
import type { TextId } from './index';

export type SearchableField = keyof Pick<RedditPostData, 'author' | 'title' | 'selftext' | 'link_flair_text'>;
export type SearchableRedditPostData = Pick<RedditPostData, SearchableField> & { id: string | number };
export interface SearchableRedditPost {
    data: SearchableRedditPostData;
}
export type FilterRule = (DocSearch & { field: SearchableField })[];

export const allFields: SearchableField[] = ['title', 'selftext', 'author', 'link_flair_text'];

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

    const result = new Set<TextId>();

    for (let i = 0; i < queriesLists.length; i++) {
        const qList = queriesLists[i];
        if (!qList)
            continue;
        const ids = doc.search(qList);
        ids.forEach(id => result.add(id));
    }
    return posts.filter(p => result.has(p.data.id));
}
