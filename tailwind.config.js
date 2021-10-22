const colors = require('tailwindcss/colors');

module.exports = {
    mode: 'jit',
    purge: {
        content: ['./**/*.svelte', './**/*.pcss'],
    },
    darkMode: false,
    theme: {
        extend: {
            colors: {
                sky: colors.sky,
                coolGray: colors.coolGray,
                trueGray: colors.trueGray,
                blueGray: colors.blueGray,
                warmGray: colors.warmGray,
                skin: {
                    bg: 'var(--color-bg-base)',
                    accent: 'var(--color-accent)',
                    accent2: 'var(--color-accent2)',
                    gray: 'var(--color-gray)',
                    outline: 'var(--color-outline)',
                    delimiter: 'var(--color-delimiter)',
                    error: 'var(--color-error)',
                    success: 'var(--color-success)',
                    link: 'var(--color-link)',
                    'item-hover': 'var(--color-item-bg-hover)',
                    btn: 'var(--color-btn)',
                    'btn-hover': 'var(--color-btn-hover)',
                    'btn-active': 'var(--color-btn-active)',
                },
            },
            borderColor: {
                skin: {
                    base: 'var(--color-border)',
                    'input-checked': 'var(--color-input-bg-checked)',
                },
            },
            boxShadow: {
                sidebar: 'var(--shadow-sidebar)',
                input: 'var(--shadow-input-hover)',
            },
            textColor: {
                skin: { base: 'var(--color-text-base)' },
            },
            backgroundColor: {
                skin: {
                    base: 'var(--color-bg-base)',
                    input: 'var(--color-input-bg)',
                    hover: 'var(--color-input-bg-hover)',
                    'input-checked': 'var(--color-input-bg-checked)',
                },
            },
        },
    },
    variants: {
        extend: {},
    },
    // plugins: [require('@tailwindcss/forms')],
    future: {
        purgeLayersByDefault: true,
        removeDeprecatedGapUtilities: true,
    },
};
