const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env) => {
    const isChrome = env.target === 'chrome';
    const destDir = isChrome ? 'dist/chrome' : 'dist/firefox';
    const copyPatterns = [{
        from: '**/*',
        context: 'src/common',
    }];
    if (isChrome) {
        copyPatterns.push({
            from: 'node_modules/webextension-polyfill/dist/browser-polyfill.js',
        }, {
            from: '**/*',
            context: 'src/chrome',
        });
    }

    return ({
        entry: {
            background: './src/scripts/background/background.js',
            popup: './src/scripts/popup/popup.js',
            options: './src/scripts/options/options.js',
        },
        output: {
            path: path.resolve(__dirname, destDir),
            filename: 'bundles/[name].js',
        },
        mode: 'none',
        watchOptions: {
            ignored: ['node_modules'],
        },
        plugins: [
            new CopyWebpackPlugin(copyPatterns),
        ],
    });
};
