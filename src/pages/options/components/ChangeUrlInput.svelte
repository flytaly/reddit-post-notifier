<script lang="ts">
    import { getRedditBaseUrl } from '@/utils';
    import type { ExtensionOptions } from '@/types/extension-options';
    import { storageData } from '@options/store';
    import storage from '@/storage';
    import getMsg from '@/utils/get-message';
    import OptionsItem from './OptionsItem.svelte';
    import RadioGroup from './RadioGroup.svelte';

    let url = '';

    const setUrl = (urlType: ExtensionOptions['redditUrlType']) => {
        url = getRedditBaseUrl(urlType, $storageData.options.customRedditUrl);
    };

    setUrl($storageData.options.redditUrlType);

    const redditTypesList: Array<{ value: ExtensionOptions['redditUrlType']; id: string; label: string }> = [
        { value: 'new', id: 'new', label: 'default' },
        { value: 'old', id: 'old', label: 'old' },
        { value: 'custom', id: 'custom', label: 'custom' },
    ];

    const onRedditTypeChange = async (redditUrlType: ExtensionOptions['redditUrlType']) => {
        setUrl(redditUrlType);
        await storage.saveOptions({ redditUrlType });
    };

    function validateUrl(s: string): string | false {
        try {
            return new URL(s).href;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    let wasSaved = true;

    async function save() {
        const temp = validateUrl(url);
        if (!temp) return;
        await storage.saveOptions({ customRedditUrl: temp });
        url = temp;
        wasSaved = true;
    }
</script>

<OptionsItem title={getMsg('optionUseOldReddit')}>
    <div slot="description">{getMsg('optionUseOldRedditDescription')}</div>
    <div slot="controls">
        <div>
            <RadioGroup
                bind:currentValue={$storageData.options.redditUrlType}
                valueList={redditTypesList}
                onChange={onRedditTypeChange}
                name="redditUrlType"
            />
            <div class="mt-2 flex items-center">
                <input
                    bind:value={url}
                    class="rounded-r-none border border-r-0"
                    type="url"
                    on:input={() => (wasSaved = false)}
                    on:change={save}
                    disabled={$storageData.options.redditUrlType != 'custom'}
                    data-testid="redditUrlInput"
                />
                <button
                    type="submit"
                    on:click={save}
                    class="standard-button min-w-[5em] px-2"
                    disabled={$storageData.options.redditUrlType != 'custom'}
                    data-testid="saveUrlBtn"
                >
                    {#if wasSaved}
                        saved
                    {:else}
                        save
                    {/if}
                </button>
            </div>
        </div>
    </div>
</OptionsItem>
