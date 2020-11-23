<script>
    import { debounce, subredditNameRegExp, getMsg } from '../../utils';
    import storage from '../../storage';
    import OptionItem from './option-item.svelte';
    import LabelContainer from './label-container.svelte';
    import NotificationLabel from './notification-label.svelte';

    export let subredditNotify;
    export let subredditList;
    export let subredditsData;

    if (!Array.isArray(subredditList)) subredditList = [];

    let inputRef;
    let inputString = subredditList.join(' ');
    let errorList = subredditList.reduce((acc, subreddit) => {
        const error = subredditsData[subreddit]?.error;
        if (error) acc.push({ subreddit, ...error });
        return acc;
    }, []);

    const saveInput = async () => {
        const { valid, invalid } = inputString
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

        if (invalid.length) {
            inputRef.setCustomValidity(`Invalid subreddits names: ${invalid.join(' ')}`);
        } else {
            inputRef.setCustomValidity('');
            if (errorList.length) {
                errorList = errorList.filter((e) => valid.includes(e.subreddit));
            }
        }

        return storage.saveSubredditList(valid);
    };

    const changeHandler = debounce(saveInput, 200);
</script>

<style>
    input[type='text'] {
        width: 100%;
        margin-top: 0.5rem;
    }
    .input-wrapper {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }
    .input-info {
        color: var(--grey);
        font-size: 0.9rem;
    }
    .error-block {
        margin-top: 0.5rem;
    }
    .error-block b {
        color: var(--accent-color);
    }
    ul {
        list-style: none;
        margin: 0;
    }
</style>

<OptionItem title={getMsg('optionSubreddits')} column>
    <div slot="description">
        <span>{getMsg('optionSubredditsTooltip1')}</span>
        <span>{getMsg('optionSubredditsTooltip2')}</span>
    </div>
    <div slot="controls">
        <div class="input-wrapper">
            <input
                bind:this={inputRef}
                type="text"
                placeholder="formula1 learnprogramming"
                bind:value={inputString}
                on:input={changeHandler} />
            <div class="input-info">{getMsg('optionSubredditsDescription')}</div>
        </div>
        <LabelContainer indent>
            <input
                slot="input"
                type="checkbox"
                bind:checked={subredditNotify}
                on:change={() => storage.saveOptions({ subredditNotify })} />
            <span slot="description">
                <NotificationLabel checked={subredditNotify} text={getMsg('optionSubredditsNotify')} />
            </span>
        </LabelContainer>
    </div>
    {#if errorList.length}
        <div class="error-block">
            <b>Subreddits with errors:</b>
            <ul>
                {#each errorList as { error, subreddit, message }}
                    <li><b>{`r/${subreddit}: `}</b> <span class="error">{`${error} ${message}`}</span></li>
                {/each}
            </ul>
        </div>
    {/if}
</OptionItem>
