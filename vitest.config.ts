/// <reference types="vitest" />
import process from 'node:process';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { r } from './scripts/utils';
import { sharedConfig } from './vite.config';

export default defineConfig({
    resolve: sharedConfig.resolve,
    root: r('src'),
    plugins: [
        svelte({
            configFile: r('svelte.config.js'),
            hot: !process.env.VITEST,
        }),
    ],
    test: {
        environment: 'jsdom',
        setupFiles: r('./src/test-utils/setup-tests.ts'),
    },
});
