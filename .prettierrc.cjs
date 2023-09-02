module.exports = {
    arrowParens: 'always',
    bracketSpacing: true,
    endOfLine: 'lf',
    printWidth: 120,
    semi: false,
    semi: true,
    singleQuote: true,
    tabWidth: 4,
    trailingComma: 'all',
    useTabs: false,
    overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }],
    plugins: [
        'prettier-plugin-svelte',
        'prettier-plugin-tailwindcss', // tailwindcss plugin must be placed at the end
    ],
};
