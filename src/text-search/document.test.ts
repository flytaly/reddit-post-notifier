import { Index } from './index';
import { Document } from './document';
import type { DocField } from './document';

describe('Document', () => {
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
        console.log(doc.indexes['author']);
        expect(doc.indexes['title'].map).toMatchObject({ title: [1, 2], words: [1], another: [2] });
        expect(doc.indexes['text'].map).toMatchObject({ post: [1], text: [1], something: [2] });
        expect(doc.indexes['author'].map).toMatchObject({ Cats: [1], 'Author name': [2, 3] });
    });
});
