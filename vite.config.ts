import { svelte } from '@sveltejs/vite-plugin-svelte';
import fs from 'fs';
import { resolve } from 'path';
import type { Plugin } from 'rollup';
import svgInlineLoader from 'svg-inline-loader';
import { defineConfig } from 'vite';
import { getEnvKeys } from './scripts/utils';

//TODO: remove this once https://github.com/vitejs/vite/pull/2909 gets merged
const svgLoader: (options?: {
    classPrefix?: string;
    idPrefix?: string;
    removeSVGTagAttrs?: boolean;
    warnTags?: boolean;
    removeTags?: boolean;
    warnTagAttrs?: boolean;
    removingTagAttrs?: boolean;
}) => Plugin = (options?: Record<string, unknown>) => {
    return {
        name: 'vite-svg-patch-plugin',
        transform: function (code, id) {
            if (id.endsWith('.svg')) {
                const extractedSvg = fs.readFileSync(id, 'utf8');
                return `export default '${svgInlineLoader.getExtractedSVG(extractedSvg, options) as string}'`;
            }
            return code;
        },
    };
};

const preventSVGEmit = () => {
    return {
        generateBundle(opts, bundle) {
            for (const key in bundle) {
                if (key.endsWith('.svg')) {
                    delete bundle[key];
                }
            }
        },
    };
};

const port = parseInt(process.env.PORT || '') || 3303;
const r = (...args: string[]) => resolve(__dirname, ...args);
const optPath = 'src/pages/options/';

export default defineConfig(({ command }) => {
    return {
        root: r('src/pages'),
        base: command === 'serve' ? `http://localhost:${port}/` : undefined,
        server: {
            port,
            hmr: {
                host: 'localhost',
            },
        },
        // esbuild: { minify: false },
        build: {
            minify: 'terser',
            terserOptions: {
                mangle: false,
                format: { beautify: true },
                compress: { defaults: false, dead_code: true, unused: true },
            },
            chunkSizeWarningLimit: 1000, // inline svgs can cause chunks size to be big, but it doesn't matter, cause it's local extension
            outDir: r('extension/dist'),
            emptyOutDir: false,
            rollupOptions: {
                input: {
                    popup: r('src/pages/popup/index.html'),
                    options: r(optPath, 'index.html'),
                    info: r(optPath, 'info.html'),
                    backup: r(optPath, 'import-export.html'),
                    donate: r(optPath, 'donate.html'),
                    watch: r(optPath, 'watch.html'),
                },
            },
        },
        define: getEnvKeys(),
        resolve: {
            alias: {
                '@assets': r('src/assets'),
                '@': r('src'),
                '@options': r(optPath),
            },
        },
        plugins: [
            svelte({ configFile: r('svelte.config.js') }),
            svgLoader(),
            // rewrite assets to use relative path
            {
                name: 'assets-rewrite',
                enforce: 'post',
                apply: 'build',
                transformIndexHtml(html) {
                    return html.replace(/"\/assets\//g, '"../assets/');
                },
            },
            preventSVGEmit(),
        ],

        optimizeDeps: {},
    };
});
