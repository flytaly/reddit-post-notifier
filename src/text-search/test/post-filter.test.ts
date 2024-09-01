import { describe, expect, it } from 'vitest';

import type { TextId } from '../index';
import type { FilterRule, SearchableField, SearchableRedditPost } from '../post-filter';
import { postFilter } from '../post-filter';
import { fixtures } from './fixtures';

function m(fieldToQueryMap: Partial<Record<SearchableField, string>>) {
    return Object.entries(fieldToQueryMap).map(([field, query]) => ({ field, query })) as FilterRule;
}

const ids = (...idList: TextId[]) => idList.map(id => ({ data: { id } }));

const posts: SearchableRedditPost[] = fixtures.map(data => ({ data }));

describe('post filter', () => {
    it('should filter given posts', () => {
        let filtered = postFilter(posts, [[{ field: 'title', query: 'dog' }]], ['title']);
        expect(filtered).toMatchObject(ids(2));

        // title contains 'dog' or 'seal'
        filtered = postFilter(posts, [m({ title: 'dog' }), m({ title: 'seal' })], ['title']);
        expect(filtered).toMatchObject(ids(1, 2));

        // title OR selftext contain 'dog'
        filtered = postFilter(posts, [m({ title: 'dog' }), m({ selftext: 'dog' })], ['title', 'selftext']);
        expect(filtered).toMatchObject(ids(2, 3));

        // title AND selftext contain 'dog'
        filtered = postFilter(posts, [m({ title: 'dog', selftext: 'dog' })], ['title', 'selftext']);
        expect(filtered).toMatchObject(ids(2));

        // author is
        filtered = postFilter(posts, [m({ author: 'JakeCakes' })], ['author']);
        expect(filtered).toMatchObject(ids(2, 3, 4));

        // shouldn't stem author query
        filtered = postFilter(posts, [m({ author: 'JakeCake' })], ['author']);
        expect(filtered).toMatchObject([]);

        // flair is
        filtered = postFilter(posts, [m({ link_flair_text: 'dogs' })], ['link_flair_text']);
        expect(filtered).toMatchObject(ids(2, 3));

        // shouldn't stem flair query
        filtered = postFilter(posts, [m({ link_flair_text: 'dog' })], ['link_flair_text']);
        expect(filtered).toMatchObject([]);

        // multiple words
        filtered = postFilter(posts, [m({ selftext: 'Spaniel dog' })], ['selftext']);
        expect(filtered).toMatchObject(ids(2, 3));

        filtered = postFilter(posts, [m({ selftext: 'Toy Spaniel' })], ['selftext']);
        expect(filtered).toMatchObject(ids(2));
    });

    it('should filter with negative query ', () => {
        let filtered: SearchableRedditPost[];

        // single negative filter
        filtered = postFilter(posts, [[{ field: 'selftext', query: 'seal', queryType: 'negative' }]], ['selftext']);
        expect(filtered).toMatchObject(ids(2, 3, 4));

        // multiple negative filters
        filtered = postFilter(posts, [[
            { field: 'selftext', query: 'papillon', queryType: 'negative' },
            { field: 'selftext', query: 'seal', queryType: 'negative' },
        ]], ['selftext']);
        expect(filtered).toMatchObject(ids(3, 4));

        // positive + negative filters
        filtered = postFilter(posts, [[
            { field: 'selftext', query: 'dog', queryType: 'positive' },
            { field: 'selftext', query: 'Papillon', queryType: 'negative' },
        ]], ['selftext']);
        expect(filtered).toMatchObject(ids(3));

        // different fields
        filtered = postFilter(posts, [[
            { field: 'author', query: 'JakeCakes', queryType: 'positive' },
            { field: 'selftext', query: 'dog', queryType: 'negative' },
        ]], ['author', 'selftext']);
        expect(filtered).toMatchObject(ids(4));

        // no match
        filtered = postFilter(posts, [[
            { field: 'author', query: 'JakeCakes', queryType: 'positive' },
            { field: 'selftext', query: 'dog', queryType: 'negative' },
            { field: 'selftext', query: 'cat', queryType: 'negative' },
        ]], ['author', 'selftext']);
        expect(filtered).toMatchObject(ids());

        // author
        filtered = postFilter(posts, [[
            { field: 'author', query: 'JakeCakes', queryType: 'negative' },
        ]], ['author']);
        expect(filtered).toMatchObject(ids(1));
    });
});
