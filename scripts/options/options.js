/* eslint-disable no-param-reassign */
import storage from '../storage';
import { translateElement } from '../l10n';
import { generateId } from '../utils';

const $ = document.querySelector.bind(document);

function debounce(func, wait) {
    let waiting = false;
    let tmId;
    return (...args) => {
        if (waiting) clearTimeout(tmId);
        waiting = true;
        tmId = setTimeout(() => {
            func(...args);
            waiting = false;
        }, wait);
    };
}

const subredditNameRegExp = /^[A-Za-z0-9]\w{1,20}$/;

function getSearchTmp() {
    const tmp = $('#search-tmp');
    translateElement(tmp.content);
    return tmp.content;
}

async function saveQueryFieldset(fieldset) {
    const checkSubreddits = subs => subs
        .split('+')
        .every(s => subredditNameRegExp.test(s));

    const inputs = Array.from(fieldset.getElementsByTagName('input'));
    const subredditInput = fieldset.querySelector('.subreddit input');
    const data = inputs
        .reduce((acc, currentInput) => {
            const { name, checked } = currentInput;
            let { value } = currentInput;

            if (value) {
                value = value.trim();
                if (name === 'subreddit') value = value.replace(/\s/g, '+');
            }
            if (name === 'notify') value = checked;

            return { ...acc, [name]: value };
        }, { id: fieldset.dataset.id });

    if (data.subreddit && !checkSubreddits(data.subreddit)) {
        subredditInput.classList.add('invalid');
        return;
    }
    subredditInput.classList.remove('invalid');

    if (!data.query) return;
    await storage.saveQuery(data);
}

function createQueryFields(template, {
    name = '', subreddit = '', query = '', id, notify = false,
} = {}, error) {
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
        errorElem.querySelector('span').textContent = `${error.error} ${error.message} ${error.reason ? `(${error.reason})` : ''}`;
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

async function restoreOptions() {
    const {
        watchSubreddits, messages, messageNotify, subredditNotify,
    } = await storage.getOptions();
    const subredditData = await storage.getSubredditData();
    const queryData = await storage.getQueriesData();
    const watchQueries = await storage.getQueriesList();

    // ------- Mail -------
    const showMessages = $('#messages');
    const messageNotifyCheckbox = $('#messageNotify');
    showMessages.checked = messages;
    messageNotifyCheckbox.disabled = !showMessages.checked;
    messageNotifyCheckbox.checked = messageNotify;

    // ------- Subreddits -------
    if (watchSubreddits && watchSubreddits.length) {
        const subreddits = $('#subreddits');
        subreddits.value = watchSubreddits.join(' ');
        const errors = watchSubreddits.reduce((fragment, subreddit) => {
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

document.addEventListener('DOMContentLoaded', async () => {
    await restoreOptions();

    const showMessages = $('#messages');
    const messageNotifyCheckbox = $('#messageNotify');
    showMessages.addEventListener('change', async () => {
        await storage.saveOptions({ messages: showMessages.checked });
        messageNotifyCheckbox.disabled = !showMessages.checked;
        if (!showMessages.checked) {
            await storage.removeMessages();
            messageNotifyCheckbox.checked = false;
        }
    });
    messageNotifyCheckbox.addEventListener('change', async () => {
        await storage.saveOptions({ messageNotify: messageNotifyCheckbox.checked });
    });


    const subreddits = $('#subreddits');
    const subredditNotifyCheckbox = $('#subredditNotify');
    const saveInput = async () => {
        const values = subreddits
            .value
            .trim()
            .split(' ')
            .reduce((acc, curr) => {
                if (curr === '') return acc;

                if (subredditNameRegExp.test(curr)) {
                    acc.valid.push(curr);
                } else {
                    acc.invalid.push(curr);
                }

                return acc;
            }, { valid: [], invalid: [] });

        const watchSubreddits = values.valid;
        await storage.saveOptions({ watchSubreddits });
        await storage.prune({ watchSubreddits });

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
});
