import { Index, IndexOpts, TextId } from './index';
import { DocSearch, Document } from './document';
import type { DocField } from './document';
import { fixtures } from './fixtures';

describe('Document creation', () => {
    const posts = [
        { id: 1, author: 'Cats', title: 'title words', text: 'post text' },
        { id: 2, author: 'Author name', title: 'another title', text: 'something' },
        { id: 3, author: 'Author name', title: 'News' },
    ];
    const fields: DocField[] = [
        {
            field: 'title',
            options: { stemmer: false },
        },
        { field: 'text' },
        { field: 'author', options: { normalize: false, tokenizer: false, stemmer: false } },
    ];

    test('should create indexes with given options for each field', () => {
        const doc = new Document({ fields, id: 'id' });
        expect(doc.fields).toEqual(fields);
        expect(doc.id).toBe('id');
        fields.forEach((f) => {
            expect(doc.indexes[f.field]).toBeInstanceOf(Index);
        });
        expect(doc.indexes[fields[0].field].stemmer).toBe(false);
    });

    test('should add words to indexes', () => {
        const doc = new Document({ fields });
        posts.forEach((p) => doc.add(p));
        expect(doc.indexes['title'].map).toMatchObject({ title: [1, 2], words: [1], another: [2] });
        expect(doc.indexes['text'].map).toMatchObject({ post: [1], text: [1], something: [2] });
        expect(doc.indexes['author'].map).toMatchObject({ Cats: [1], 'Author name': [2, 3] });
    });
});

describe('Document search', () => {
    const disableProcessing: IndexOpts = { normalize: false, tokenizer: false, stemmer: false };
    const fields: DocField[] = Object.keys(fixtures[0])
        .filter((f) => f !== 'id')
        .map((field) => {
            return {
                field,
                options: field === 'author' || field === 'link_flair_text' ? disableProcessing : {},
            };
        });

    test('should find text', () => {
        const doc = new Document({ fields, id: 'id' });
        fixtures.forEach((p) => doc.add(p));

        /** @param input - [field, query] */
        const s = (input: [string, string][], result: TextId[]) => {
            const search = input.map(([field, query]) => ({ field, query } as DocSearch));
            expect(doc.search(search)).toEqual(result);
        };

        s([['author', 'JakeCakes']], [2, 3, 4]);
        s(
            [
                ['author', 'JakeCakes'],
                ['link_flair_text', 'dogs'],
            ],
            [2, 3],
        );
        s([['author', 'JakeCake']], []);
        s([['link_flair_text', 'dog']], []);
        s([['link_flair_text', 'dogs']], [2, 3]);
        s([['selftext', 'dog']], [2, 3]);
        // all fields should match
        s(
            [
                ['title', 'dog'],
                ['selftext', 'dog'],
            ],
            [2],
        );
    });
});
