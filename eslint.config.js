import js from '@eslint/js';
import { includeIgnoreFile } from '@eslint/compat';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default ts.config(
    includeIgnoreFile(gitignorePath),
    js.configs.recommended,
    ...ts.configs.recommended,
    ...svelte.configs['flat/recommended'],
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
    stylistic.configs.customize({
        indent: 4,
        quotes: 'single',
        semi: true,
        jsx: false,
    }),
    {
        files: ['**/*.svelte', '**/*.svelte.ts'],
        rules: {
            'svelte/no-at-html-tags': 'off',
            'svelte/indent': ['warn', { indent: 4 }],
            '@stylistic/js/indent': 'off',
            '@stylistic/indent-binary-ops': 'off',
        },
        languageOptions: {
            parserOptions: {
                parser: ts.parser,
            },
        },
    },
);
