const conf = {};

if (TARGET === 'chrome') {
    conf.clientId = '';
    conf.clientSecret = '';
    conf.redirectUri = 'https://*.chromiumapp.org/';
    // https://github.com/reddit-archive/reddit/wiki/api#rules
    conf.userAgent = '';
} else {
    conf.clientId = '';
    conf.clientSecret = '';
    conf.redirectUri = 'https://localhost/';
    // https://github.com/reddit-archive/reddit/wiki/api#rules
    conf.userAgent = '';
}

export const {
    clientId, clientSecret, redirectUri, userAgent,
} = conf;
