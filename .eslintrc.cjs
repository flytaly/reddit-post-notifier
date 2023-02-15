module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
    ],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
        extraFileExtensions: ['.svelte'],
    },
    globals: {
        mockBrowser: true,
    },
    env: {
        browser: true,
        jest: true,
        webextensions: true,
    },
    overrides: [
        {
            files: ['*.svelte'],
            processor: 'svelte3/svelte3',
        },
    ],
    settings: {
        'svelte3/typescript': require('typescript'),
        'svelte3/ignore-styles': () => true,
    },
    plugins: ['svelte3', '@typescript-eslint'],
    ignorePatterns: ['node_modules', '/*.js', 'src/test-utils/jest'],
    rules: {
        'prefer-const': 'warn',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-extra-semi': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
    },
};
