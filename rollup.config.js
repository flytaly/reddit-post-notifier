import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import css from 'rollup-plugin-css-only';
import svelte from 'rollup-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import del from 'rollup-plugin-delete';
import copy from 'rollup-plugin-copy-watch';
import replace from '@rollup/plugin-replace';
import svelteSVG from 'rollup-plugin-svelte-svg';
import json from '@rollup/plugin-json';

const production = !process.env.ROLLUP_WATCH;
const target = process.env.target === 'chrome' ? 'chrome' : 'firefox';
const outputPath = target === 'firefox' ? './dist/firefox/' : './dist/chrome/';

const envKeys = () => {
    const envRaw = require('dotenv').config().parsed || {};
    envRaw.NODE_ENV = production ? 'production' : 'development';
    envRaw.TARGET = target;
    return Object.keys(envRaw).reduce(
        (envValues, envValue) => ({
            ...envValues,
            [`process.env.${envValue}`]: JSON.stringify(envRaw[envValue]),
        }),
        {},
    );
};

const plugins = [
    svelte({
        preprocess: sveltePreprocess({
            ...require('./svelte.config').preprocessOption,
            sourceMap: !production,
        }),
        compilerOptions: {
            // enable run-time checks when not in production
            dev: !production,
        },
    }),
    svelteSVG(),
    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
        browser: true,
        dedupe: ['svelte', 'svelte/transition', 'svelte/internal'],
    }),
    commonjs(),
    typescript({ sourceMap: !production, inlineSources: !production }),
    json(),
    replace({ ...envKeys(), preventAssignment: true }),
];

const copyPlugin = copy({
    ...(!production ? { watch: ['files/**/*'] } : {}),
    targets: [
        { src: 'files/common/*', dest: outputPath },
        { src: `files/${target}/*`, dest: `${outputPath}` },
    ],
    copyOnce: true,
});

const delPlugin = del({ targets: outputPath, runOnce: true });

export default [
    {
        input: 'src/popup/popup.ts',
        output: {
            sourcemap: !production,
            file: `${outputPath}/bundles/popup.js`,
            name: 'popup',
            format: 'es',
        },
        plugins: [...plugins, copyPlugin, css({ output: 'popup.css' }), ...(!production ? [] : [delPlugin])],
    },
    {
        input: 'src/background/background.ts',
        output: {
            sourcemap: !production,
            name: 'background',
            file: `${outputPath}bundles/background.js`,
            format: 'iife',
        },
        plugins,
        watch: { clearScreen: false },
    },
    {
        input: 'src/options/index.ts',
        output: {
            sourcemap: !production,
            name: 'options',
            file: `${outputPath}bundles/options.js`,
            format: 'es',
        },
        plugins: [...plugins, css({ output: 'options.css' })],
        watch: { clearScreen: false },
    },
];
