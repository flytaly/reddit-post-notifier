import storage from '../storage';
import { debounce, $, subredditNameRegExp } from '../utils';
import types from '../types';
import applyTheme from '../theme';
import { setTooltips } from './tooltips_old_old';
import { restoreOptions } from './restoreOptions_old';

function setListeners() {
    const bgScriptPort = browser.runtime.connect();

    const updateIntervalInput = $('#updateInterval');
    const saveUpdateInterval = async () => {
        const updateInterval = parseInt(updateIntervalInput.value.trim(), 10);
        if (!Number.isNaN(updateInterval) && updateInterval > 0) {
            await storage.saveOptions({ updateInterval });
            if (bgScriptPort) bgScriptPort.postMessage({ type: types.SCHEDULE_NEXT_UPDATE });
        }
    };
    updateIntervalInput.addEventListener('input', debounce(saveUpdateInterval, 200));

    const themeSwitcher = $('#theme');
    themeSwitcher.addEventListener('change', async ({ target }) => {
        await storage.saveOptions({ theme: target.value || 'auto' });
        applyTheme();
    });

    const delAfterClick = $('#delPostAfterBodyClick');
    delAfterClick.addEventListener('change', () =>
        storage.saveOptions({
            delPostAfterBodyClick: delAfterClick.checked,
        }),
    );

    const hideEmptyGroups = $('#hideEmptyGroups');
    hideEmptyGroups.addEventListener('change', () =>
        storage.saveOptions({
            hideEmptyGroups: hideEmptyGroups.checked,
        }),
    );

    const showMessages = $('#messages');
    const messageNotifyCheckbox = $('#messageNotify');
    showMessages.addEventListener('change', async () => {
        const opts = { messages: showMessages.checked };
        messageNotifyCheckbox.disabled = !showMessages.checked;
        if (!showMessages.checked) {
            opts.messageNotify = false;
            await storage.removeMessages();
            messageNotifyCheckbox.checked = false;
        }
        await storage.saveOptions(opts);
    });
    messageNotifyCheckbox.addEventListener('change', async () => {
        await storage.saveOptions({ messageNotify: messageNotifyCheckbox.checked });
    });

    const subreddits = $('#subreddits');
    const subredditNotifyCheckbox = $('#subredditNotify');
    const saveInput = async () => {
        const values = subreddits.value
            .trim()
            .split(' ')
            .reduce(
                (acc, curr) => {
                    if (curr === '') return acc;

                    if (subredditNameRegExp.test(curr)) {
                        acc.valid.push(curr);
                    } else {
                        acc.invalid.push(curr);
                    }

                    return acc;
                },
                { valid: [], invalid: [] },
            );

        await storage.saveSubredditList(values.valid);

        if (values.invalid.length) {
            subreddits.setCustomValidity(`Invalid subreddits names: ${values.invalid.join(' ')}`);
            subreddits.classList.add('invalid');
        } else {
            subreddits.setCustomValidity('');
            subreddits.classList.remove('invalid');
        }
    };
    const debouncedListener = debounce(saveInput, 200);
    subreddits.addEventListener('input', debouncedListener);
    subredditNotifyCheckbox.addEventListener('change', async () => {
        await storage.saveOptions({ subredditNotify: subredditNotifyCheckbox.checked });
    });

    const clearDataButton = $('#clearData');
    clearDataButton.addEventListener('click', async () => {
        if (bgScriptPort) bgScriptPort.postMessage({ type: types.RESET });
        setTimeout(() => window.location.reload(), 100);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await restoreOptions();
    setListeners();
    setTooltips();

    const storeLink = $('#storeLink');
    if (storeLink) {
        storeLink.href =
            TARGET === 'chrome'
                ? 'https://chrome.google.com/webstore/detail/reddit-post-notifier/hoolgoecmeegpbidbbcefgkjegdejibd/reviews'
                : 'https://addons.mozilla.org/firefox/addon/reddit-post-notifier/reviews/';
    }
});
