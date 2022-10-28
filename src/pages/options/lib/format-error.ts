import type { RedditError } from '@/reddit-api/reddit-types';

export const formatError = (e?: RedditError | null) =>
    e ? `Fetch error: ${e.error || ''} ${e.message || ''} ${e.reason ? '(' + e.reason + ')' : ''}` : '';
