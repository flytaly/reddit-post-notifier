module.exports = {
    transform: {
        '^.+\\.svelte$': ['svelte-jester', { preprocess: true }],
        '^.+\\.ts$': 'ts-jest',
        '^.+\\.svg$': '<rootDir>/src/test-utils/jest/svelte-svg-transform.js',
        '^.+\\.(js|mjs)$': 'babel-jest',
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@assets/(.*)$': '<rootDir>/src/assets/$1',
        '^@options/(.*)$': '<rootDir>/src/pages/options/$1',
    },
    moduleFileExtensions: ['js', 'svelte', 'mjs', 'ts'],
    setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect', '<rootDir>/src/test-utils/setupTest.ts'],
    testEnvironment: 'jsdom',
    collectCoverageFrom: ['<rootDir>/src/**/*.{ts,svelte}', '!**/node_modules/**'],
    testMatch: ['<rootDir>/src/**/*.test.ts'],
};

function ignoreModules(modules) {
    return `node_modules/(?!(${modules.join('|')})/)`;
}
