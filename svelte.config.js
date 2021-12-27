const sveltePreprocess = require('svelte-preprocess');

const preprocessOption = { postcss: true };

module.exports = {
    preprocess: sveltePreprocess(preprocessOption),
    preprocessOption,
};
