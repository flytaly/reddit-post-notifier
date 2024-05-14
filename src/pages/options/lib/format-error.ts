import type { RedditError } from '@/reddit-api/reddit-types';

export function formatError(e?: RedditError | null) {
    return e ? `Fetch error: ${e.error || ''} ${e.message || ''} ${e.reason ? `(${e.reason})` : ''}` : '';
}
