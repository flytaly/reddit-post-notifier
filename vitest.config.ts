import { svelte } from '@sveltejs/vite-plugin-svelte';
import process from 'node:process';
import { svelteTesting } from '@testing-library/svelte/vite';
/// <reference types="vitest" />
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
        svelteTesting(),
    ],
    test: {
        environment: 'happy-dom',
        setupFiles: r('./src/test-utils/setup-tests.ts'),
    },
});
