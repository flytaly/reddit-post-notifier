module.exports = {
    content: ['./**/*.svelte', './**/*.pcss'],
    theme: {
        extend: {
            colors: {
                skin: {
                    bg: 'var(--color-bg-base)',
                    bg2: 'var(--color-bg-second)',
                    accent: 'var(--color-accent)',
                    accent2: 'var(--color-accent2)',
                    gray: 'var(--color-gray)',
                    gray2: 'var(--color-gray2)',
                    outline: 'var(--color-outline)',
                    delimiter: 'var(--color-delimiter)',
                    text: 'var(--color-text-base)',
                    error: {
                        DEFAULT: 'var(--color-error)',
                        bg: 'var(--color-error-bg)',
                    },
                    success: 'var(--color-success)',
                    link: 'var(--color-link)',
                    'item-hover': 'var(--color-item-bg-hover)',
                    'input-checked': 'var(--color-input-bg-checked)',
                    'input-hover': 'var(--color-input-bg-hover)',
                    input: 'var(--color-input-bg)',
                    btn: 'var(--color-btn)',
                    'btn-hover': 'var(--color-btn-hover)',
                    'btn-active': 'var(--color-btn-active)',
                },
            },
            borderColor: {
                skin: {
                    base: 'var(--color-border)',
                },
            },
            boxShadow: {
                'input-expand': 'var(--shadow-input-expand)',
                input: 'var(--shadow-input-hover)',
            },
        },
    },
    future: {
        purgeLayersByDefault: true,
        removeDeprecatedGapUtilities: true,
    },
};
