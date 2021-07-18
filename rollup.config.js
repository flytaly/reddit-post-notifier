import replace from '@rollup/plugin-replace';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy-watch';
import del from 'rollup-plugin-delete';
import svelte from 'rollup-plugin-svelte';
import svg from 'rollup-plugin-svg-import';

const target = process.env.target === 'chrome' ? 'chrome' : 'firefox';

const outputPath = target === 'firefox' ? './dist/firefox/' : './dist/chrome/';
const isWatchMode = process.env.ROLLUP_WATCH;

const isDev = isWatchMode;
const plugins = [
    svg({ stringify: true }),
    svelte({
        emitCss: false,
        compilerOptions: {
            dev: isDev,
        },
    }),
    replace({
        TARGET: `'${target}'`,
        'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
    }),
    nodeResolve({
        browser: true,
        dedupe: ['svelte'],
    }),
    commonjs(),
];

const polyfillPath =
    target !== 'firefox'
        ? 'node_modules/webextension-polyfill/dist/browser-polyfill.js'
        : 'src/firefox/browser-polyfill.js';

const copyPlugin = copy({
    ...(isWatchMode ? { watch: ['src/common/**/*', 'src/styles/**/*', `src/${target}/*`] } : {}),
    targets: [
        // { src: 'src/index.html', dest: 'dist/public' },
        { src: 'src/common/*', dest: outputPath },
        { src: 'src/styles/', dest: outputPath },
        { src: `src/${target}/*`, dest: outputPath },
        { src: polyfillPath, dest: outputPath },
        { src: 'node_modules/tippy.js/dist/tippy.css', dest: `${outputPath}styles` },
    ],
    copyOnce: true,
});

const delPlugin = del({ targets: outputPath, runOnce: true });

export default [
    {
        input: './src/scripts/popup/popup.js',
        output: {
            file: `${outputPath}bundles/popup.js`,
            format: 'es',
        },
        plugins: [copyPlugin, ...plugins, ...(isWatchMode ? [] : [delPlugin])],
    },
    {
        input: './src/scripts/options/options.js',
        output: [
            {
                file: `${outputPath}bundles/options.js`,
                format: 'es',
            },
        ],
        plugins,
    },
    {
        input: './src/scripts/background/background.js',
        output: [
            {
                file: `${outputPath}bundles/background.js`,
                name: 'background',
                format: 'iife',
            },
        ],
        plugins,
    },
];
