/* eslint-disable no-param-reassign */
import storage from '../storage';
import applyTheme from '../theme';
import { generateId, debounce, $, subredditNameRegExp } from '../utils';
import { translateElement } from '../l10n';
import auth from '../background/auth';

async function saveQueryFieldset(fieldset) {
    const checkSubreddits = (subs) => subs.split('+').every((s) => subredditNameRegExp.test(s));

    const inputs = Array.from(fieldset.getElementsByTagName('input'));
    const subredditInput = fieldset.querySelector('.subreddit input');
    const data = inputs.reduce(
        (acc, currentInput) => {
            const { name, checked } = currentInput;
            let { value } = currentInput;

            if (value) {
                value = value.trim();
                if (name === 'subreddit') value = value.replace(/\s/g, '+');
            }
            if (name === 'notify') value = checked;

            return { ...acc, [name]: value };
        },
        { id: fieldset.dataset.id },
    );

    if (data.subreddit && !checkSubreddits(data.subreddit)) {
        subredditInput.classList.add('invalid');
        return;
    }
    subredditInput.classList.remove('invalid');

    if (!data.query) return;
    await storage.saveQuery(data);
}

export function createQueryFields(template, { name = '', subreddit = '', query = '', id, notify = false } = {}, error) {
    const searchElem = template.cloneNode(true);
    const fieldset = searchElem.querySelector('fieldset');
    const nameElem = fieldset.querySelector('.name input');
    const subElem = fieldset.querySelector('.subreddit input');
    const queryElem = fieldset.querySelector('.query input');
    const deleteElem = fieldset.querySelector('button.delete');
    const notifyElem = fieldset.querySelector('.notification input');
    if (!id) id = generateId();
    fieldset.dataset.id = id;

    nameElem.value = name;
    nameElem.id = `${id}_name`;
    nameElem.parentNode.querySelector('label').htmlFor = `${id}_name`;

    subElem.value = subreddit;
    subElem.id = `${id}_subreddit`;
    subElem.parentNode.querySelector('label').htmlFor = `${id}_subreddit`;

    queryElem.value = query;
    queryElem.id = `${id}_query`;
    queryElem.parentNode.querySelector('label').htmlFor = `${id}_query`;

    notifyElem.checked = notify;
    notifyElem.id = `${id}_notify`;
    notifyElem.parentNode.querySelector('label').htmlFor = `${id}_notify`;

    if (error) {
        const errorElem = fieldset.querySelector('.query-error');
        errorElem.classList.add('show');
        errorElem.querySelector('span').textContent = `${error.error} ${error.message} ${
            error.reason ? `(${error.reason})` : ''
        }`;
    }

    deleteElem.addEventListener('click', ({ target }) => {
        const parentFieldset = target.closest('fieldset');
        const container = fieldset.closest('.container');
        container.removeChild(parentFieldset);
        storage.removeQueries([parentFieldset.dataset.id]);
    });

    const debouncedListener = debounce(() => saveQueryFieldset(fieldset), 200);
    fieldset.addEventListener('input', debouncedListener);
    return fieldset;
}

export function getSearchTmp() {
    const tmp = $('#search-tmp');
    translateElement(tmp.content);
    return tmp.content;
}

async function onAuthorization(isAuthorized = false, setMailCheck = false) {
    const { messages, messageNotify } = await storage.getOptions();

    const showMessages = $('#messages');
    const messageNotifyCheckbox = $('#messageNotify');
    const mailBlock = $('#mail-block');
    const isAuth = $('#auth-block .is-authorized');
    const noAuth = $('#auth-block .no-authorized');

    if (isAuthorized) {
        mailBlock.classList.remove('disabled');
        isAuth.hidden = false;
        noAuth.hidden = true;
    } else {
        mailBlock.classList.add('disabled');
        isAuth.hidden = true;
        noAuth.hidden = false;
    }

    showMessages.checked = messages;
    showMessages.disabled = !isAuthorized;
    messageNotifyCheckbox.disabled = !showMessages.checked || !isAuthorized;
    messageNotifyCheckbox.checked = messageNotify;
    if (setMailCheck) {
        showMessages.checked = true;
        messageNotifyCheckbox.checked = true;
        await storage.saveOptions({ messages: true, messageNotify: true });
    }
}

export async function restoreOptions() {
    applyTheme();
    const {
        subredditNotify,
        updateInterval,
        theme,
        delPostAfterBodyClick,
        hideEmptyGroups,
    } = await storage.getOptions();
    let { refreshToken } = await storage.getAuthData();
    const subredditData = await storage.getSubredditData();
    const queryData = await storage.getQueriesData();
    const watchQueries = await storage.getQueriesList();
    const subredditList = await storage.getSubredditList();

    // ------- Options -------
    const updateIntervalInput = $('#updateInterval');
    updateIntervalInput.value = updateInterval;

    // ------- Theme -------
    const themeSwitcher = $('#theme');
    const themes = themeSwitcher.elements.theme;
    themes.value = theme || 'auto';

    // ------- Delete after click -------
    const delAfterClick = $('#delPostAfterBodyClick');
    delAfterClick.checked = delPostAfterBodyClick;

    // ------- Hide Empty Groups -------
    const hideEmptyGroupsElem = $('#hideEmptyGroups');
    hideEmptyGroupsElem.checked = hideEmptyGroups;

    // ------- Mail & Auth -------
    onAuthorization(!!refreshToken);
    const startAuthBtn = $('#auth-block .no-authorized button');
    startAuthBtn.addEventListener('click', async () => {
        try {
            startAuthBtn.disabled = true;
            await auth.login();
        } catch (e) {
            console.error(e);
            const errorElem = $('#auth-error-message');
            if (errorElem) errorElem.textContent = e.message;
        }
        startAuthBtn.disabled = false;
        refreshToken = (await storage.getAuthData()).refreshToken;
        onAuthorization(!!refreshToken, true);
    });
    const signOutButton = $('#auth-block .is-authorized button');
    signOutButton.addEventListener('click', async () => {
        await storage.clearAuthData();
        refreshToken = (await storage.getAuthData()).refreshToken;
        onAuthorization(!!refreshToken, false);
    });

    // ------- Subreddits -------
    if (subredditList?.length) {
        const subreddits = $('#subreddits');
        subreddits.value = subredditList.join(' ');
        const errors = subredditList.reduce((fragment, subreddit) => {
            const { error } = subredditData[subreddit] || {};
            if (error) {
                const { reason, message, error: code } = error;
                const li = document.createElement('li');
                const subredditName = document.createElement('b');
                const errorInfo = document.createElement('span');
                subredditName.textContent = subreddit;
                errorInfo.textContent = `: ${code} ${message} ${reason ? `(${reason || ''})` : ''}`;
                li.appendChild(subredditName);
                li.appendChild(errorInfo);
                fragment.appendChild(li);
            }
            return fragment;
        }, document.createDocumentFragment());

        if (errors.children.length) {
            const errorsBlock = $('.subreddits-errors');
            const errorsList = errorsBlock.querySelector('ul');
            errorsBlock.classList.add('show');
            errorsList.appendChild(errors);
        }
    }
    const subredditNotifyCheckbox = $('#subredditNotify');
    subredditNotifyCheckbox.checked = subredditNotify;

    // ------- Custom queries -------
    const searchContainer = $('.watch-queries .container');
    const searchTmp = getSearchTmp();
    const row = watchQueries.map((query) => {
        const error = queryData[query.id] && queryData[query.id].error;
        return createQueryFields(searchTmp, query, error);
    });
    row.push(createQueryFields(searchTmp));
    searchContainer.append(...row);

    const addSearchButton = $('.watch-queries .add-search');
    addSearchButton.addEventListener('click', () => {
        searchContainer.appendChild(createQueryFields(searchTmp));
    });
}
