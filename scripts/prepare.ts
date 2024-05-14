// code mostly from https://github.com/antfu/vitesse-webext
// generate stub index.html files for dev entry
import fs from 'fs-extra';
import chokidar from 'chokidar';
import { getManifest } from '../src/manifest';
import { isDev, log, port, r } from './utils';

/** Stub html to use Vite in development */
async function stubIndexHtml() {
    const pages = ['options', 'popup', 'offscreen'];

    for (const view of pages) {
        await fs.ensureDir(r(`extension/dist/${view}`));
        const files = await fs.readdir(r(`src/pages/${view}`));
        const pages = files.filter(f => f.endsWith('.html'));
        let page = '';
        for (page of pages) {
            let data = await fs.readFile(r(`src/pages/${view}/${page}`), 'utf-8');
            const reg = /<script\ssrc="\.\/(?<filename>.*\.ts)"/;
            const scriptFileName = data.match(reg)?.groups?.filename || '';
            data = data.replace(`"./${scriptFileName}"`, `"http://localhost:${port}/${view}/${scriptFileName}"`);
            await fs.writeFile(r(`extension/dist/${view}/${page}`), data, 'utf-8');
            log('PRE', `stub ${view}/${page}`);
        }
    }
}

export async function writeManifest() {
    await fs.writeJSON(r('extension/manifest.json'), await getManifest(), { spaces: 2 });
    log('PRE', 'write manifest.json');
}

void writeManifest();

if (isDev) {
    void stubIndexHtml();
    chokidar.watch(r('pages/**/*.html')).on('change', () => {
        void stubIndexHtml();
    });
    chokidar.watch([r('src/manifest.ts'), r('package.json')]).on('change', () => {
        void writeManifest();
    });
}
