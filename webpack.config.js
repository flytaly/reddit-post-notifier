const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        background: './scripts/background/background.js',
        popup: './scripts/popup/popup.js',
        options: './scripts/options/options.js',
    },
    output: {
        path: path.resolve(__dirname, 'extension'),
        filename: 'bundles/[name].js',
    },
    mode: 'none',
    watchOptions: {
        ignored: ['node_modules'],
    },
    plugins: [
        new CopyWebpackPlugin([
            {
                from: 'node_modules/webextension-polyfill/dist/browser-polyfill.js',
            },
        ]),
    ],
};
