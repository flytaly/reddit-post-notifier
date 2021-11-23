import type { TextId } from '../index';
import type { FilterRule, SearchableField, SearchableRedditPost } from '../post-filter';
import { postFilter } from '../post-filter';
import { fixtures } from './fixtures';

const m = (fieldToQueryMap: Partial<Record<SearchableField, string>>) =>
    Object.entries(fieldToQueryMap).map(([field, query]) => ({ field, query })) as FilterRule;

const ids = (...idList: TextId[]) => idList.map((id) => ({ data: { id } }));

const posts: SearchableRedditPost[] = fixtures.map((data) => ({ data }));

describe('Post filter', () => {
    test('should filter given posts', () => {
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
});
