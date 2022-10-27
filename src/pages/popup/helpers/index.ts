import { RedditObjectKind } from '@/reddit-api/reddit-types';
import type { RedditItem } from '@/reddit-api/reddit-types';

export function getItemTitle(post: RedditItem) {
    if (post.kind === RedditObjectKind.link) {
        return post.data.title;
    } else if (post.kind === RedditObjectKind.comment) {
        return post.data.body?.length > 80 ? post.data.body.slice(0, 80) + '...' : post.data.body;
    }
}

export function idToUserIdx(id: string): number | null {
    const indexNum = parseInt(id.split('_')[1]);
    if (!isNaN(indexNum)) return indexNum;
    return null;
}
