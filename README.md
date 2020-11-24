# Reddit post notifier

[ ![addons.mozilla.org/](https://ffp4g1ylyit3jdyti1hqcvtb-wpengine.netdna-ssl.com/addons/files/2015/11/get-the-addon.png)](https://addons.mozilla.org/firefox/addon/reddit-post-notifier/)
[ ![chrome.google.com/](https://developer.chrome.com/webstore/images/ChromeWebStore_BadgeWBorder_v2_206x58.png)](https://chrome.google.com/webstore/detail/reddit-post-notifier/hoolgoecmeegpbidbbcefgkjegdejibd)

Firefox/Chrome extension that watches for posts in given subreddits or reddit searches and notifies about the new ones.

[![Video demonstration](https://img.youtube.com/vi/PZ69Vljtrg8/0.jpg)](https://www.youtube.com/watch?v=PZ69Vljtrg8)

## Usage for developers

-   `> npm run start:ff`
-   `> npm run start:chrome`
    -   build the extension with [rollup](https://github.com/rollup/rollup) and run it in Firefox or Chrome using [web-ext](https://github.com/mozilla/web-ext)
-   `> npm run buildzip:ff`
-   `> npm run buildzip:chrome`
    -   create an extension package in /web-ext-artifacts folder
-   `> npm run test`
    -   test extension's code with jest

### Authorization

This extension uses [OAuth2](https://github.com/reddit-archive/reddit/wiki/OAuth2) authorization to check reddit private mail. To generate credentials [create new reddit app](https://www.reddit.com/prefs/apps/) and then add id of the app in `/scripts/config.js` as `clientId` string.

### External libraries and frameworks

Popup and option page UI are made with [Svelte](https://github.com/sveltejs/svelte).

## Keyboard shortcuts

|                          Key                          | Function                                                       |
| :---------------------------------------------------: | -------------------------------------------------------------- |
|     <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>S</kbd>      | Open the extension's popup                                     |
|            <kbd>&darr;</kbd>, <kbd>j</kbd>            | Select the next item                                           |
|            <kbd>&uarr;</kbd>, <kbd>k</kbd>            | Select the previous item                                       |
|   <kbd>&rarr;</kbd>, <kbd>l</kbd>, <kbd>Enter</kbd>   | Expand selected posts group; open selected post in the new tab |
| <kbd>&larr;</kbd>, <kbd>h</kbd>, <kbd>Backspace</kbd> | Collapse selected posts group                                  |
|                   <kbd>Space</kbd>                    | Mark selected item as read (remove it)                         |
|                     <kbd>p</kbd>                      | Pin selected post; remove already pinned post                  |

## License

The code of the extension is licensed under the [MPL-2.0](LICENSE).
