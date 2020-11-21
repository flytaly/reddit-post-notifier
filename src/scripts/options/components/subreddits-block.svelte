<script>
    import { debounce, subredditNameRegExp, getMsg } from '../../utils';
    import storage from '../../storage';
    import OptionItem from './option-item.svelte';
    import LabelContainer from './label-container.svelte';
    import BellIcon from '../../assets/bell.svg';
    import NotificationLabel from './notification-label.svelte';

    export let subredditNotify;
    export let subredditList;
    export let subredditsData;

    let inputRef;
    let inputString = subredditList.join ? subredditList.join(' ') : '';

    const saveInput = async () => {
        const values = inputString
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

        if (values.invalid.length) {
            inputRef.setCustomValidity(`Invalid subreddits names: ${values.invalid.join(' ')}`);
        } else {
            inputRef.setCustomValidity('');
        }

        return storage.saveSubredditList(values.valid);
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
    <!-- TODO: show subreddits errors -->
    <ul>
        <li>error</li>
        <li>error</li>
    </ul>
</OptionItem>
