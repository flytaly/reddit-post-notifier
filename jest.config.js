module.exports = {
    transform: {
        '^.+\\.svelte$': ['svelte-jester', { preprocess: true }],
        '^.+\\.ts$': 'ts-jest',
        '^.+\\.svg$': '<rootDir>/src/jest-utils/svelte-svg-transform.js',
        '^.+\\.(js|mjs)$': 'babel-jest',
    },
    moduleFileExtensions: ['js', 'svelte', 'mjs', 'ts'],
    setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
    testEnvironment: 'jsdom',
    collectCoverageFrom: ['src/**/*.{ts,svelte}', '!**/node_modules/**'],
};

function ignoreModules(modules) {
    return `node_modules/(?!(${modules.join('|')})/)`;
}
