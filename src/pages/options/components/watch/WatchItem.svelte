<script lang="ts">
    import * as icons from '@/pages/options/icons';
    import { tooltip } from '@/pages/options/tooltip';
    import getMsg from '@/utils/get-message';
    import IosCheckbox from '@options/components/common/IosCheckbox.svelte';

    export let isActive = false;
    export let name = '';
    export let disabled = false;
    export let errorMessage = '';
    export let showEditBlock = false;
    export let onDelete: () => void;
    export let onFetch: () => void;
    export let onActiveToggle: () => void;

    const toggleEditBlock = () => {
        showEditBlock = !showEditBlock;
    };
</script>

<div class="rounded-md" class:expanded={showEditBlock}>
    <div
        class="subreddit-grid rounded-md border border-dashed border-transparent bg-skin-bg"
        class:delimiter={showEditBlock}
    >
        <!-- Input name -->
        <button
            class="flex h-full border-none p-0 px-2 text-left text-sm"
            on:click={toggleEditBlock}
            data-testid="input-name"
        >
            <div class="w-full overflow-hidden text-ellipsis whitespace-nowrap" class:font-bold={name}>
                {name}
            </div>
            {#if errorMessage}
                <div class="flex justify-center" use:tooltip={{ content: errorMessage }} data-testid="warning-icon">
                    <div class="h-5 w-5 text-skin-error">
                        {@html icons.WarningIcon}
                    </div>
                </div>
            {/if}
        </button>

        <!-- Fetch posts -->
        <button
            class="flex items-center p-0 text-xs text-skin-text hover:text-skin-accent2 disabled:text-skin-gray"
            on:click={onFetch}
            use:tooltip={{ content: getMsg('optionsWatchInputFetchDesc') }}
            {disabled}
        >
            <div class="mr-1 h-5 w-5 text-skin-accent2">
                {@html icons.RefreshIcon2}
            </div>
            <span>{getMsg('optionsSubredditFetch')}</span>
        </button>

        <IosCheckbox
            tooltipText={getMsg('optionWatchInputDisable')}
            bind:checked={isActive}
            changeHandler={onActiveToggle}
            data-testid="isActive"
        />

        <slot name="toggles" />

        <!-- Toggle editor -->
        <button
            class="flex items-center justify-start border-transparent bg-transparent px-2 py-0"
            on:click={toggleEditBlock}
        >
            <span class="h-5 w-5">
                {@html icons.EditIcon}
            </span>
            <span>Edit</span>
        </button>

        <!-- Delete -->
        <button
            class="icon-button text-skin-accent"
            aria-label={getMsg('optionWatchInputDelete')}
            use:tooltip={{ content: getMsg('optionWatchInputDelete') }}
            on:click={onDelete}
        >
            <div class="h-5 w-5">{@html icons.DeleteIcon}</div>
        </button>

        <!-- Post list row -->
        <div class="col-span-full">
            <slot name="posts-block" />
        </div>
    </div>

    <!-- Editor -->
    {#if showEditBlock}
        <div class="col-span-full m-2 pb-2">
            <slot />
        </div>
    {/if}
</div>

<style lang="postcss">
    .expanded {
        @apply bg-skin-bg2 shadow-input-expand ring-skin-delimiter;
    }
    .delimiter {
        @apply border-b-skin-delimiter;
    }
</style>
