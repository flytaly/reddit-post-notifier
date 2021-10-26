import { Index } from './index';

describe('Search Index', () => {
    test('should add tokens to the map', () => {
        const idx = new Index();
        idx.add(1, 'Some text');
        idx.add(2, 'Another text string');
        idx.add(3, 'Test: Русский текст');
        expect(idx.map).toMatchObject({
            some: [1],
            text: [1, 2],
            another: [2],
            string: [2],
            test: [3],
            русский: [3],
            текст: [3],
        });
    });
    test('should normalize and stem words', () => {
        const idx = new Index();
        idx.add('id1', 'cats, ended, disappointment');
        idx.add('id2', 'cat');
        expect(idx.map).toMatchObject({
            cat: ['id1', 'id2'],
            end: ['id1'],
            disappoint: ['id1'],
        });
    });
});
