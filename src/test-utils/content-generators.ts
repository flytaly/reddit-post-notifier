import faker from 'faker';

import type { RedditPostData } from '../reddit-api/reddit-types';

export const generatePost = (props: Partial<RedditPostData> = {}): RedditPostData => {
    const created = faker.time.recent();
    const subreddit = faker.lorem.word();
    const title = faker.lorem.sentence(4);
    const post: RedditPostData = {
        author: faker.internet.userName(),
        created_utc: created,
        created,
        id: faker.random.alphaNumeric(8),
        name: `t3_${faker.lorem.slug(1)}`,
        permalink: `/r/${subreddit}/${title.toLowerCase().split(' ').join('_')}`,
        subreddit,
        title,
        url: faker.internet.url(),
        preview: {
            images: [
                {
                    id: faker.random.alphaNumeric(8),
                    source: { url: faker.image.imageUrl() },
                },
            ],
        },
        ...props,
    };
    return post;
};
