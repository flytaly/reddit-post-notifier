declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: 'production' | 'development' | 'test';
        TARGET: 'chrome' | 'firefox';

        CHROME_CLIENT_ID: string;
        CHROME_CLIENT_SECRET: string;
        CHROME_REDIRECT_URI: string;
        CHROME_USER_AGENT: string;
        FIREFOX_CLIENT_ID: string;
        FIREFOX_CLIENT_SECRET: string;
        FIREFOX_REDIRECT_URI: string;
        FIREFOX_USER_AGENT: string;
    }
}
