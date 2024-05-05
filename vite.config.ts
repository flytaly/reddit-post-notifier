import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig, type UserConfig } from 'vite';

import { getEnvKeys, isDev, r } from './scripts/utils';

const port = parseInt(process.env.PORT || '') || 3303;
const optPath = 'src/pages/options/';

export const sharedConfig: Partial<UserConfig> = {
    root: r('src/pages'),
    define: getEnvKeys(),
    resolve: {
        alias: {
            '@assets': r('src/assets'),
            '@': r('src'),
            '@options': r(optPath),
        },
    },
};

export const sharedBuildConfig: UserConfig['build'] = {
    minify: 'terser',
    terserOptions: {
        mangle: false,
        format: { beautify: true },
        compress: { defaults: false, dead_code: true, unused: true },
    },
    outDir: r('extension/dist/'),
    emptyOutDir: false,
    sourcemap: isDev ? 'inline' : false,
};

export default defineConfig(({ command }) => {
    return {
        ...sharedConfig,
        base: command === 'serve' ? `http://localhost:${port}/` : undefined,
        server: {
            port,
            hmr: {
                host: 'localhost',
            },
        },
        build: {
            ...sharedBuildConfig,
            chunkSizeWarningLimit: 1000, // inline svgs can cause chunks size to be big, but it doesn't matter, cause it's local extension
            rollupOptions: {
                input: {
                    popup: r('src/pages/popup/index.html'),
                    offscreen: r('src/pages/offscreen/index.html'),
                    options: r(optPath, 'index.html'),
                    info: r(optPath, 'info.html'),
                    backup: r(optPath, 'import-export.html'),
                    donate: r(optPath, 'donate.html'),
                    watch: r(optPath, 'watch.html'),
                },
            },
        },
        plugins: [
            svelte({ configFile: r('svelte.config.js') }),
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
