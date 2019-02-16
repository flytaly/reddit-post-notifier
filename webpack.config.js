const path = require('path');

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
};
