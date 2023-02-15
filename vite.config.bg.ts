import { defineConfig } from 'vite';
import { sharedBuildConfig, sharedConfig } from './vite.config';
import { isDev, r } from './scripts/utils';
import packageJson from './package.json';

// bundling the content script using Vite
export default defineConfig({
    ...sharedConfig,
    build: {
        ...sharedBuildConfig,
        watch: isDev ? {} : undefined,
        lib: {
            entry: r('src/background/background.ts'),
            name: packageJson.name,
            formats: ['iife'],
        },
        rollupOptions: {
            output: {
                entryFileNames: 'background.js',
                extend: true,
            },
        },
    },
});
