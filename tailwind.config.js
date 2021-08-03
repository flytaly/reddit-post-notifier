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
                accent: 'var(--color-accent)',
            },
            boxShadow: {
                sidebar: 'var(--sidebar-shadow)',
            },
            textColor: {
                skin: {
                    base: 'var(--color-text-base)',
                },
            },
            backgroundColor: {
                skin: {
                    base: 'var(--color-bg-base)',
                },
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [require('@tailwindcss/forms')],
    future: {
        purgeLayersByDefault: true,
        removeDeprecatedGapUtilities: true,
    },
};
