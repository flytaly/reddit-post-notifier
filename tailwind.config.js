const colors = require('tailwindcss/colors');

module.exports = {
    mode: 'jit',
    purge: {
        content: ['./**/*.svelte', './**/*.pcss'],
    },
    darkMode: 'class', // or 'media' or 'class'
    theme: {
        extend: {},
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
