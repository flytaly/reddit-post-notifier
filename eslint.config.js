import antfu from '@antfu/eslint-config';

export default antfu({
    formatters: true,
    svelte: true,
    stylistic: {
        indent: 4,
        semi: true,
    },
}, {
    rules: {
        'svelte/no-at-html-tags': 'off',
    },
});
