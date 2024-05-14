import { resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';
import { bgCyan, black } from 'kolorist';

// export const getTarget = () => {
//     const result = process.argv.find((a) => a === '--chrome' || a === '--firefox') || '--chrome';
//     return result.slice(2) as 'chrome' | 'firefox';
// };
// export const getNodeEnv = () => {
//     const res = process.argv.find((a) => a === '--dev' || a === '--prod') || '--prod';
//     if (res === '--dev') return 'development';
//     return 'production';
// };

export const isDev = process.env.NODE_ENV === 'development';
export const target = process.env.TARGET === 'firefox' ? 'firefox' : 'chrome';

export const port = Number.parseInt(process.env.PORT || '') || 3303;

const __dirname = fileURLToPath(new URL('.', import.meta.url));
export const r = (...args: string[]) => resolve(__dirname, '..', ...args);

export function log(name: string, message: string) {
    console.log(black(bgCyan(` ${name} `)), message);
}

export function getEnvKeys() {
    const envRaw = dotenv.config().parsed || {};
    envRaw.NODE_ENV = process.env.NODE_ENV || 'production';
    envRaw.TARGET = target;
    envRaw.USE_DEV_SERVER = process.env.USE_DEV_SERVER || '';
    return Object.keys(envRaw).reduce(
        (envValues, envValue) => ({
            ...envValues,
            [`process.env.${envValue}`]: JSON.stringify(envRaw[envValue]),
        }),
        {},
    ) as Record<string, string>;
}
