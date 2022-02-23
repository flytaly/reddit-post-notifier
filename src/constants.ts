export const IS_DEV = process.env.NODE_ENV === 'development';
export const IS_TEST = process.env.NODE_ENV === 'test';
export const TARGET = process.env.TARGET;
export const IS_CHROME = TARGET === 'chrome';
export const IS_FIREFOX = TARGET === 'firefox';

export const USE_DEV_SERVER = process.env.USE_DEV_SERVER === 'true';
export const DEV_SERVER = 'http://localhost:3000';

export const config = IS_CHROME
    ? {
          clientId: process.env.CHROME_CLIENT_ID,
          clientSecret: process.env.CHROME_CLIENT_SECRET,
          redirectUri: process.env.CHROME_REDIRECT_URI,
          // https://github.com/reddit-archive/reddit/wiki/api#rules
          userAgent: process.env.CHROME_USER_AGENT,
      }
    : {
          clientId: process.env.FIREFOX_CLIENT_ID,
          clientSecret: process.env.FIREFOX_CLIENT_SECRET,
          redirectUri: process.env.FIREFOX_REDIRECT_URI,
          userAgent: process.env.FIREFOX_USER_AGENT,
      };
