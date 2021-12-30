import type { Manifest } from 'webextension-polyfill-ts';
import pkg from '../package.json';
import { isDev, port, target } from '../scripts/utils';

type ExtManifest = Manifest.WebExtensionManifest & { key?: string };

const key =
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAi+t5ySos/8pLUphc43Y+2Ee5ehEwX86iSRannZu9lOdZTtnD6X0eiVKUvr5y2Q9abSQQ1ZFmQkf4VkbHgff0rST+ihZuRTLvOBRLel/txvk9cbwQE3YOHChXzRqNCguPSkDHBVGLbXx5UIPdG6YMrnN6VGbbmUM7yW16g55uU6SjRZm/CL2r00f6kg/nOdKcXbAc8dwOOFCLeWfHdbNmcXvD6Ud9eeKmwm+XrLz0xgIFNOj+D4vqs/p3JwdWz49Ed3j0qNcM1MQvjI42P26kDXYG5w8O9If/WyaFd6/QgvmhBdNYjfVG878bWIxdTu+McmHtSG55WffGhShmoZL1/wIDAQAB';

function browserSpecific() {
    const manifest: Partial<ExtManifest> = {};
    if (target === 'chrome') {
        manifest.minimum_chrome_version = '86';
        manifest.key = key;
    }
    if (target === 'firefox') {
        manifest.applications = {
            gecko: {
                strict_min_version: '85.0',
                id: 'reddit-post-notifier@flytaly',
            },
        };
    }
    return manifest;
}

export async function getManifest(): Promise<Manifest.WebExtensionManifest> {
    // update this file to update this manifest.json
    // can also be conditional based on your need
    return {
        manifest_version: 2,
        default_locale: 'en',
        description: '__MSG_description__',
        name: '__MSG_name__',
        version: pkg.version,
        homepage_url: 'https://github.com/flytaly/reddit-post-notifier',
        ...browserSpecific(),
        icons: {
            '48': 'images/icon-48.png',
            '96': 'images/icon-96.png',
            '128': 'images/icon-128_chrome.png',
        },
        permissions: [
            'identity',
            'storage',
            'alarms',
            'notifications',
            'https://*.reddit.com/*',
            'https://*.redd.it/*',
        ],
        background: {
            persistent: true,
            page: 'background.html',
        },
        browser_action: {
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
            _execute_browser_action: {
                suggested_key: {
                    default: 'Alt+Shift+S',
                },
            },
        },
        options_ui: {
            page: 'dist/options/index.html',
            open_in_tab: true,
        },

        // this is required on dev for Vite script to load
        content_security_policy: isDev ? `script-src 'self' http://localhost:${port}; object-src 'self'` : undefined,
    };
}
