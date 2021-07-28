import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import { getEnvKeys } from './scripts/utils';

const port = parseInt(process.env.PORT || '') || 3303;
const r = (...args: string[]) => resolve(__dirname, ...args);

export default defineConfig(({ command }) => {
    return {
        root: r('src/views'),
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
            cleanCssOptions: {
                format: 'beautify',
            },
            rollupOptions: {
                input: {
                    popup: r('src/views/popup/index.html'),
                    options: r('src/views/options/index.html'),
                },
            },
        },
        define: getEnvKeys(),
        plugins: [
            svelte(),
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
