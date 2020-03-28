const { DefinePlugin } = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env) => {
    const isChrome = env && (env.target === 'chrome');
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
    } else {
        copyPatterns.push({
            from: '**/*',
            context: 'src/firefox',
        });
    }

    return ({
        entry: {
            background: './src/scripts/background/background.js',
            popup: './src/scripts/popup/popup.js',
            popup_noauth: './src/scripts/popup_noauth.js',
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
        optimization: {
            minimize: false,
        },
        plugins: [
            new CopyWebpackPlugin(copyPatterns),
            new DefinePlugin({
                TARGET: JSON.stringify(isChrome ? 'chrome' : 'firefox'),
            }),
        ],
    });
};
