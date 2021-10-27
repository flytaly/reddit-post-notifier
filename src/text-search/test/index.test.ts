import { Index } from '../index';

describe('Search Index', () => {
    test('should add tokens to the map', () => {
        const idx = new Index();
        idx.add(1, 'Some text');
        idx.add(2, 'Another text string');
        idx.add(3, 'Test3: Русский текст');
        expect(idx.map).toMatchObject({
            some: [1],
            text: [1, 2],
            another: [2],
            string: [2],
            test3: [3],
            русский: [3],
            текст: [3],
        });
    });

    test('should normalize and stem words', () => {
        const idx = new Index();
        idx.add('id1', 'cats, ended, disappointment');
        idx.add('id2', ' cat ');
        expect(idx.map).toMatchObject({
            cat: ['id1', 'id2'],
            end: ['id1'],
            disappoint: ['id1'],
        });
    });

    test('should find text', () => {
        const idx = new Index();
        idx.add(
            1,
            'The Baikal seal, Lake Baikal seal or nerpa (Pusa sibirica), is a species of earless seal endemic to Lake Baikal in Siberia, Russia.',
        );
        idx.add(2, 'The Baikal seal is one of the smallest true seals.');
        idx.add(3, 'Seals live in the oceans of both hemispheres.');
        idx.add(
            4,
            'Байкальская нерпа, или байкальский тюлень (лат. Pusa sibirica) — один из трёх пресноводных видов тюленя в мире, эндемик озера Байкал, реликт третичной фауны.',
        );

        expect(idx.search('nerpa')).toEqual([1]);
        expect(idx.search('Baikal seal')).toEqual([1, 2]);
        expect(idx.search('seals')).toEqual([1, 2, 3]);
        expect(idx.search('phocids seal')).toEqual([]);
        expect(idx.search('sibirica')).toEqual([1, 4]);
        expect(idx.search('нерпа')).toEqual([4]);
    });
});
