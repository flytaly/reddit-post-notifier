import storage from '../storage';

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

async function restoreOptions() {
    const { watchSubreddits } = await storage.getOptions();
    if (watchSubreddits && watchSubreddits.length) {
        const subreddits = $('#subreddits');
        subreddits.value = watchSubreddits.join(' ');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await restoreOptions();
    const subreddits = $('#subreddits');
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

        if (values.valid.length) {
            const watchSubreddits = values.valid;
            await storage.saveOptions({ watchSubreddits });
            await storage.prune({ watchSubreddits });
        }
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
});
