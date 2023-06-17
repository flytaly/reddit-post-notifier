import type { Manifest } from 'webextension-polyfill-ts';
import pkg from '../package.json';
import { isDev, port, target } from '../scripts/utils';

type ExtManifest = Manifest.WebExtensionManifest & { key?: string };

const key =
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAi+t5ySos/8pLUphc43Y+2Ee5ehEwX86iSRannZu9lOdZTtnD6X0eiVKUvr5y2Q9abSQQ1ZFmQkf4VkbHgff0rST+ihZuRTLvOBRLel/txvk9cbwQE3YOHChXzRqNCguPSkDHBVGLbXx5UIPdG6YMrnN6VGbbmUM7yW16g55uU6SjRZm/CL2r00f6kg/nOdKcXbAc8dwOOFCLeWfHdbNmcXvD6Ud9eeKmwm+XrLz0xgIFNOj+D4vqs/p3JwdWz49Ed3j0qNcM1MQvjI42P26kDXYG5w8O9If/WyaFd6/QgvmhBdNYjfVG878bWIxdTu+McmHtSG55WffGhShmoZL1/wIDAQAB';

const bgScript = './dist/background.js';

function browserSpecific() {
    const manifest: Partial<ExtManifest> = {};
    if (target === 'chrome') {
        manifest.minimum_chrome_version = '105';
        manifest.key = key;
        manifest.background = {
            service_worker: bgScript,
        };
    }
    if (target === 'firefox') {
        manifest.applications = {
            gecko: {
                strict_min_version: '109.0',
                id: 'reddit-post-notifier@flytaly',
            },
        };
        manifest.background = {
            scripts: [bgScript],
        };
    }
    return manifest;
}

const info: Partial<ExtManifest> = {
    default_locale: 'en',
    description: '__MSG_description__',
    name: '__MSG_name__',
    version: pkg.version,
    homepage_url: 'https://github.com/flytaly/reddit-post-notifier',
};

export async function getManifest(): Promise<Manifest.WebExtensionManifest> {
    /* if (IS_DEV) { */
    /*     permissions.push(`${DEV_SERVER}/*`); */
    /* } */
    return {
        manifest_version: 3,
        ...info,
        ...browserSpecific(),
        icons: {
            '48': 'images/icon-48.png',
            '96': 'images/icon-96.png',
            '128': 'images/icon-128_chrome.png',
        },
        permissions: ['identity', 'storage', 'alarms', 'notifications', 'unlimitedStorage'],
        host_permissions: ['https://*.reddit.com/*', 'https://*.redd.it/*'],
        action: {
            default_title: '__MSG_extension_title__',
            default_popup: 'dist/popup/index.html',
            default_icon: {
                '16': 'images/icon-16.png',
                '32': 'images/icon-32.png',
                '64': 'images/icon-64.png',
            },
            theme_icons: [
                {
                    dark: 'images/icon-16.png',
                    light: 'images/icon-16-light.png',
                    size: 16,
                },
                {
                    dark: 'images/icon-32.png',
                    light: 'images/icon-32-light.png',
                    size: 32,
                },
                {
                    dark: 'images/icon-64.png',
                    light: 'images/icon-64-light.png',
                    size: 64,
                },
            ],
        },

        commands: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            _execute_action: {
                suggested_key: {
                    default: 'Alt+Shift+S',
                },
            },
        },
        options_ui: {
            page: 'dist/options/watch.html',
            open_in_tab: true,
        },

        content_security_policy: {
            extension_pages: isDev
                ? // this is required on dev for Vite script to load
                  `script-src 'self' http://localhost:${port}; object-src 'self'`
                : "script-src 'self'; object-src 'self'",
        },
    };
}
