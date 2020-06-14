# Reddit post notifier

[ ![addons.mozilla.org/](https://ffp4g1ylyit3jdyti1hqcvtb-wpengine.netdna-ssl.com/addons/files/2015/11/get-the-addon.png)](https://addons.mozilla.org/firefox/addon/reddit-post-notifier/)
[ ![chrome.google.com/](https://developer.chrome.com/webstore/images/ChromeWebStore_BadgeWBorder_v2_206x58.png)](https://chrome.google.com/webstore/detail/reddit-post-notifier/hoolgoecmeegpbidbbcefgkjegdejibd)

Firefox extension that watches for posts in given subreddits or reddit searches and notifies about the new ones.

## Usage

- `npm run start`
  - build the extension with [webpack](https://github.com/webpack/webpack) and run it in Firefox using [web-ext](https://github.com/mozilla/web-ext)
- `npm run buildzip:ff`
  - create an extension package in /web-ext-artifacts folder
- `npm run test`
  - test extension's code with jest

This extension uses [OAuth2](https://github.com/reddit-archive/reddit/wiki/OAuth2) authorization.  To run the extension you should [create new reddit app](https://www.reddit.com/prefs/apps/) and add id of the app in `/scripts/config.js` as `clientId` string.

## Keyboard shortcuts
| Key | Function |
|:---:| --- |
|<kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>S</kbd> | Open the extension's popup |
|<kbd>&darr;</kbd>, <kbd>j</kbd>| Select the next item |
|<kbd>&uarr;</kbd>, <kbd>k</kbd>| Select the previous item |
|<kbd>&rarr;</kbd>, <kbd>l</kbd>  | Go to the list of selected item's posts |
|<kbd>&larr;</kbd>, <kbd>h</kbd>, <kbd>Backspace</kbd>  | Go back to the main list |
|<kbd>Enter</kbd>| Open selected item. If there are no selected items open the subreddit (or reddit search) |
|<kbd>Space</kbd>| Mark selected item as read |

## License

The code of the extension is licensed under the [MPL-2.0](LICENSE).
