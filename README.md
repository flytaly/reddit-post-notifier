# Reddit post notifier

![Chrome Web Store](https://img.shields.io/chrome-web-store/v/hoolgoecmeegpbidbbcefgkjegdejibd)
![Chrome Web Store](https://img.shields.io/chrome-web-store/stars/hoolgoecmeegpbidbbcefgkjegdejibd)
![Chrome Web Store](https://img.shields.io/chrome-web-store/users/hoolgoecmeegpbidbbcefgkjegdejibd)

![Mozilla Add-on](https://img.shields.io/amo/v/reddit-post-notifier)
![Mozilla Add-on](https://img.shields.io/amo/stars/reddit-post-notifier)
![Mozilla Add-on](https://img.shields.io/amo/users/reddit-post-notifier)

[ ![chrome.google.com/](https://i.imgur.com/unvdmLG.png)](https://chrome.google.com/webstore/detail/reddit-post-notifier/hoolgoecmeegpbidbbcefgkjegdejibd)
[ ![addons.mozilla.org/](https://user-images.githubusercontent.com/1577569/225926070-baa9ed48-841c-4ce7-bf70-557f848eed23.png)](https://addons.mozilla.org/firefox/addon/reddit-post-notifier/)



A browser extension that watches and notifies about:

-   **new posts** in subreddits and Reddit searches,
-   unread **private messages** in multiple accounts,
-   the latest **users' comments and posts**.

[![Video demonstration](https://img.youtube.com/vi/PZ69Vljtrg8/0.jpg)](https://www.youtube.com/watch?v=PZ69Vljtrg8)

## Usage for developers

Intall depencencies with `npm install`.

Then, to build and watch changes to the code and style files, and run the corresponding browser using `web-ext`

    npm run dev:ff
    npm run dev:chrome

To build the extension in the "extension" folder.

    npm run build:ff
    npm run build:chrome

To archive the contents of the "extension" folder as a package in the /web-ext-artifacts folder

    npm run zip    

### Authorization

This extension uses [OAuth2](https://github.com/reddit-archive/reddit/wiki/OAuth2) authentication to get athorization and refresh tokens. These tokens will be used to check reddit private mail. To generate credentials [create new reddit app](https://www.reddit.com/prefs/apps/), and add id of the app in `.env` file (see .env.example). 

### External libraries and frameworks

The pop-up and option pages UI are made with [Svelte](https://github.com/sveltejs/svelte) + [Tailwind CSS](https://tailwindcss.com/) and bundled with [esbuild](https://github.com/evanw/esbuild) and [Vite](https://github.com/vitejs/vite).

## Keyboard shortcuts

|                          Key                          | Function                                                       |
| :---------------------------------------------------: | -------------------------------------------------------------- |
|     <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>S</kbd>      | Open the extension's popup                                     |
|            <kbd>&darr;</kbd>, <kbd>j</kbd>            | Select the next item                                           |
|            <kbd>&uarr;</kbd>, <kbd>k</kbd>            | Select the previous item                                       |
|   <kbd>&rarr;</kbd>, <kbd>l</kbd>, <kbd>Enter</kbd>   | Expand selected posts group; open selected item in the new tab |
| <kbd>&larr;</kbd>, <kbd>h</kbd>, <kbd>Backspace</kbd> | Collapse selected posts group                                  |
|                   <kbd>Space</kbd>                    | Mark selected item as read (remove it)                         |
|                     <kbd>p</kbd>                      | Pin selected post; remove already pinned post                  |

## License

The code of the extension is licensed under the [MPL-2.0](LICENSE).
