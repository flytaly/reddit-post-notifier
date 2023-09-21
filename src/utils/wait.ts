import { IS_TEST } from '@/constants';

export const wait = (ms = 1000) => {
    if (IS_TEST) return Promise.resolve();
    return new Promise((resolve) => setTimeout(resolve, ms));
};
