<script lang="ts">
    import { debounce, subredditNameRegExp } from '../../../utils';
    import storage from '../../../storage';
    import OptionsItem from './OptionsItem.svelte';
    import Labeled from './Labeled.svelte';
    import type { SubredditData } from '../../../storage/storage-types';
    import getMsg from '../../../utils/get-message';
    import BellIcon from '../../../assets/bell.svg';

    export let subredditNotify: boolean;
    export let subredditList: string[];
    export let subredditsData: SubredditData;

    if (!Array.isArray(subredditList)) subredditList = [];

    let inputRef: HTMLInputElement;
    let inputString: string = subredditList.join(' ');

    type SubredditError = {
        error?: number;
        message?: string;
        subreddit: string;
        reason?: string;
    };
    let errorList: SubredditError[] = subredditList.reduce((acc, subreddit) => {
        const error = subredditsData[subreddit]?.error;
        if (error) acc.push({ subreddit, ...error });
        return acc;
    }, [] as SubredditError[]);

    const getErrSubreddit = (e: SubredditError) => `r/${e.subreddit}`;
    const getErrMessage = (e: SubredditError) => {
        return `${e.error} ${e.message} ${e.reason ? '(' + e.reason + ')' : ''}`;
    };

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

<OptionsItem title={getMsg('optionSubreddits')} labelFor="subredditInput" column>
    <div slot="description">
        <span>{getMsg('optionSubredditsTooltip1')}</span>
        <span>{getMsg('optionSubredditsTooltip2')}</span>
    </div>
    <div slot="controls">
        <div class="flex flex-col items-start pt-2 w-full">
            <input
                class="w-full"
                id="subredditInput"
                type="text"
                placeholder="formula1 learnprogramming"
                bind:this={inputRef}
                bind:value={inputString}
                on:input={changeHandler}
            />
            <div class="text-skin-gray text-sm">{getMsg('optionSubredditsDescription')}</div>
        </div>
        <Labeled indent>
            <input
                slot="input"
                type="checkbox"
                bind:checked={subredditNotify}
                on:change={() => storage.saveOptions({ subredditNotify })}
            />
            <span slot="description">
                <div class="flex items-center">
                    <span class={`h-4 w-4 mr-2 ${subredditNotify ? 'text-skin-accent' : 'text-skin-base'}`}>
                        {@html BellIcon}
                    </span>
                    {getMsg('optionSubredditsNotify')}
                </div>
            </span>
        </Labeled>
    </div>
    {#if errorList.length}
        <div class="mt-2">
            <b class="text-skin-accent">Subreddits with errors:</b>
            <ul>
                {#each errorList as err}
                    <li>
                        <b>{getErrSubreddit(err)}</b>
                        <span class="error">{getErrMessage(err)}</span>
                    </li>
                {/each}
            </ul>
        </div>
    {/if}
</OptionsItem>
