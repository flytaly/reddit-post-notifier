module.exports = {
    transform: {
        '^.+\\.svelte$': ['svelte-jester', { preprocess: true }],
        '^.+\\.ts$': 'ts-jest',
        '^.+\\.svg$': '<rootDir>/src/test-utils/jest/svelte-svg-transform.js',
        '^.+\\.(js|mjs)$': 'babel-jest',
    },
    moduleFileExtensions: ['js', 'svelte', 'mjs', 'ts'],
    setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect', '<rootDir>/src/test-utils/setupTest.ts'],
    testEnvironment: 'jsdom',
    collectCoverageFrom: ['<rootDir>/**/*.{ts,svelte}', '!**/node_modules/**'],
    testMatch: ['<rootDir>/src/**/*.test.ts'],
};

function ignoreModules(modules) {
    return `node_modules/(?!(${modules.join('|')})/)`;
}
