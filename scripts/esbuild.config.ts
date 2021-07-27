import { build } from 'esbuild';
import { getEnvKeys, isDev, log, target } from './utils';

const outfile = './extension/dist/background.js';

build({
    entryPoints: ['./src/background/background.ts'],
    bundle: true,
    outfile,
    define: getEnvKeys(),
    watch: isDev,
    format: 'iife',
})
    .then(() => {
        log(`esbuild`, `Built ${outfile} for ${target}`);
        if (isDev) {
            log('esbuild', `watch for changes`);
        }
    })
    .catch(() => process.exit(1));
