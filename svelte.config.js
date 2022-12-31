import sveltePreprocess from 'svelte-preprocess';

const preprocessOption = { postcss: true };

export default {
    preprocess: sveltePreprocess(preprocessOption),
    preprocessOption,
};
