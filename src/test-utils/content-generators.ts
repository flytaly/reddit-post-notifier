import faker from 'faker';
import type { RedditMessage, RedditMessageData, RedditPost, RedditPostData } from '../reddit-api/reddit-types';
import type { QueryOpts } from '../storage/storage-types';

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
        link_flair_text: faker.lorem.slug(3),
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

export const generatePosts = (num = 2, subreddit?: string) => {
    if (!subreddit) subreddit = faker.lorem.word();
    const posts: RedditPost[] = Array(num)
        .fill(null)
        .map(() => ({ data: generatePost({ subreddit }) }));
    return posts;
};

export const generateQuery = (props: Partial<QueryOpts> = {}): QueryOpts => {
    return {
        id: faker.random.alphaNumeric(8),
        query: faker.random.word(),
        name: faker.lorem.word(),
        subreddit: faker.lorem.word(),
        ...props,
    };
};

export const generateMessage = (props: Partial<RedditMessageData> = {}): RedditMessage => {
    const created = faker.time.recent();
    return {
        data: {
            author: faker.internet.userName(),
            author_fullname: faker.random.alphaNumeric(8),
            created,
            created_utc: created,
            body: 'body',
            body_html: 'body_html',
            subject: 'message_subject',
            dest: faker.internet.userName(),
            id: faker.random.alphaNumeric(8),
            name: faker.random.alphaNumeric(8),
            ...props,
        },
    };
};
