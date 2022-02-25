import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import { getEnvKeys } from './scripts/utils';
import { getExtractedSVG } from 'svg-inline-loader';
import type { Plugin } from 'rollup';
import fs from 'fs';

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
                return `export default '${getExtractedSVG(extractedSvg, options) as string}'`;
            }
            return code;
        },
    };
};

const port = parseInt(process.env.PORT || '') || 3303;
const r = (...args: string[]) => resolve(__dirname, ...args);

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
            outDir: r('extension/dist'),
            emptyOutDir: false,
            rollupOptions: {
                input: {
                    popup: r('src/pages/popup/index.html'),
                    options: r('src/pages/options/index.html'),
                    info: r('src/pages/options/info.html'),
                },
            },
        },
        define: getEnvKeys(),
        resolve: {
            alias: {
                '@assets': r('src/assets'),
                '@': r('src'),
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
        ],

        optimizeDeps: {},
    };
});
