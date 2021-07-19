// This file is needed for svelte vs-code extension for correct <style> block parsing

const sveltePreprocess = require('svelte-preprocess');

const preprocessOption = {
    sourceMap: true,
    postcss: {
        plugins: [require('postcss-import'), require('postcss-nested'), require('tailwindcss')],
    },
};

module.exports = {
    preprocess: sveltePreprocess(preprocessOption),
    preprocessOption,
};
