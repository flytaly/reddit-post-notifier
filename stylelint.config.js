module.exports = {
    extends: ['stylelint-config-standard', 'stylelint-config-prettier'],
    rules: {
        'at-rule-no-unknown': [
            true,
            {
                ignoreAtRules: ['tailwind', 'apply', 'variants', 'responsive', 'screen', 'layer'],
            },
        ],
        'function-no-unknown': [true, { ignoreFunctions: ['theme'] }],
        'declaration-block-trailing-semicolon': null,
        'no-descending-specificity': null,
        'selector-pseudo-class-no-unknown': [
            true,
            {
                ignorePseudoClasses: ['global'],
            },
        ],
        'hue-degree-notation': 'off',
        'color-function-notation': 'legacy',
        'alpha-value-notation': 'off',
    },
};
