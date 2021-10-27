import type { SearchableRedditPost } from '../post-filter';

export const fixtures: SearchableRedditPost[] = [
    {
        author: 'Everday33',
        id: 1,
        title: 'The Bailkal seal',
        selftext:
            'The Baikal seal, Lake Baikal seal or nerpa (Pusa sibirica), is a species of earless seal endemic to Lake Baikal in Siberia, Russia.',
        link_flair_text: 'seals',
    },
    {
        author: 'JakeCakes',
        id: 2,
        title: 'Papillon dog',
        selftext:
            "The Papillon (French pronunciation: ​[papijɔ̃], French for 'butterfly[-eared]'), also called the Continental Toy Spaniel, is a breed of dog, of the spaniel type.",
        link_flair_text: 'dogs',
    },
    {
        author: 'JakeCakes',
        id: 3,
        title: 'Spaniel',
        selftext: 'A spaniel is a type of gun dog. Spaniels were especially bred to flush game out of denser brush.',
        link_flair_text: 'dogs',
    },
    {
        author: 'JakeCakes',
        id: 4,
        title: 'European Shorthair',
        selftext: 'The European Shorthair, called the European in FIFe and WCF is a cat breed originating in Sweden',
        link_flair_text: 'cats',
    },
];
